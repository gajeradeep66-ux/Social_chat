import Message from '../models/Message.js'
import User from '../models/User.js'
import cloudinary from '../lib/cloudinary.js'
import { io, getReceiverSocketId } from '../lib/socket.js'
import mongoose from 'mongoose'

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUser = await User.findById(loggedInUserId);

        const getArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return [val];
        };

        const contactIdsFromFollow = [
            ...getArray(loggedInUser?.followers),
            ...getArray(loggedInUser?.following)
        ].map(id => id.toString());

        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        const chatPartnerIds = messages.map(msg => 
            msg.senderId.toString() === loggedInUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString()
        );

        const allContactIds = [...new Set([...contactIdsFromFollow, ...chatPartnerIds])];
        const objectIds = allContactIds.map(id => new mongoose.Types.ObjectId(id));

        const contacts = await User.find({
            _id: { $in: objectIds, $ne: loggedInUserId }
        }).select("-password");

        res.status(200).json(contacts);

    } catch (error) {
        console.error("Error in get all contacts:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const {id: userToChatId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const message = await Message.find({
            $or : [
                {senderId:myId, receiverId: userToChatId},
                {senderId:userToChatId, receiverId: myId},
            ]
        });

        res.status(200).json(message);
    } catch (error) {
        console.error("Error in get messages:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text , image , video , audio } = req.body;
        const { id : receiverId } = req.params;
        const senderId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID" });
        }

        if (!text && !image && !video && !audio) {
            return res.status(400).json({ message: "Text or image or video or audio is required." });
        }

        if (senderId.toString() === receiverId.toString()) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
        }

        const receiverExists = await User.exists({ _id: receiverId });

        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        const loggedInUser = await User.findById(senderId);
        const getArray = (val) => (!val ? [] : Array.isArray(val) ? val : [val]);
        const followersStr = getArray(loggedInUser?.followers).map(id => id.toString());
        const followingStr = getArray(loggedInUser?.following).map(id => id.toString());

        const existingMessages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        const isContact = followersStr.includes(receiverId.toString()) ||
                        followingStr.includes(receiverId.toString()) ||
                        existingMessages.length > 0;

        if (!isContact) {
            return res.status(403).json({ message: "You can only chat with accepted contacts." });
        }

        let imageUrl;
        let videoUrl;
        let audioUrl;

        if ( image ) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
        if ( video ) {
            const uploadResponse = await cloudinary.uploader.upload(video, { resource_type: "auto" })
            videoUrl = uploadResponse.secure_url
        }
        if ( audio ) {
            const uploadResponse = await cloudinary.uploader.upload(audio, { resource_type: "auto" })
            audioUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl ,
            video : videoUrl ,
            audio : audioUrl 
        })

        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.error("Error in send message:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id

        const messages = await Message.find({
            $or : [
                {senderId : loggedInUserId},
                {receiverId : loggedInUserId}
            ]
        })

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const objectIds = chatPartnerIds.map(id => new mongoose.Types.ObjectId(id));

        const chatPartners = await User.find({
            _id: { $in: objectIds, $ne: loggedInUserId }
        }).select("-password");


        res.status(200).json(chatPartners)
    } catch (error) {
        console.error("Error in get chat partners:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}