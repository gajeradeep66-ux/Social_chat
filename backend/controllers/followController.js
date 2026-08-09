import User from '../models/User.js'
import mongoose from 'mongoose'

const ensureArray = (doc, field) => {
    if (!doc[field] || !Array.isArray(doc[field])) {
        doc[field] = doc[field] ? [doc[field]] : [];
    }
};

const getId = (id) => (id && id._id ? id._id.toString() : id ? id.toString() : "");

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user._id } }, // exclude logged-in user
            "fullName email profilePic followers following followRequests"
        );

        res.status(200).json(users);
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendFollowRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid target user ID" });
        }

        if (senderId.toString() === receiverId)
            return res.status(400).json({ message: "Cannot follow yourself" });

        const receiver = await User.findById(receiverId);

        if (!receiver)
            return res.status(404).json({ message: "User not found" });

        ensureArray(receiver, "followRequests");
        ensureArray(receiver, "followers");

        if (receiver.followRequests.some((id) => getId(id) === senderId.toString()))
            return res.status(400).json({ message: "Request already sent" });

        if (receiver.followers.some((id) => getId(id) === senderId.toString()))
            return res.status(400).json({ message: "Already in contacts" });

        receiver.followRequests.push(senderId);
        await receiver.save();

        res.json({ message: "Follow request sent" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const acceptFollowRequest = async (req, res) => {
    try {
        const myId = req.user._id;
        const senderId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ message: "Invalid sender user ID" });
        }

        const me = await User.findById(myId);
        const sender = await User.findById(senderId);

        if (!me || !sender) return res.status(404).json({ message: "User not found" });

        ensureArray(me, "followRequests");
        ensureArray(me, "followers");
        ensureArray(me, "following");
        ensureArray(sender, "followRequests");
        ensureArray(sender, "followers");
        ensureArray(sender, "following");

        me.followRequests = me.followRequests.filter(
            (id) => getId(id) !== senderId.toString()
        );
        sender.followRequests = sender.followRequests.filter(
            (id) => getId(id) !== myId.toString()
        );

        if (!me.followers.some((id) => getId(id) === senderId.toString())) {
            me.followers.push(senderId);
        }
        if (!me.following.some((id) => getId(id) === senderId.toString())) {
            me.following.push(senderId);
        }

        if (!sender.followers.some((id) => getId(id) === myId.toString())) {
            sender.followers.push(myId);
        }
        if (!sender.following.some((id) => getId(id) === myId.toString())) {
            sender.following.push(myId);
        }

        await me.save();
        await sender.save();

        res.json({ message: "Follow request accepted" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const rejectFollowRequest = async (req, res) => {
    try {
        const myId = req.user._id;
        const senderId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ message: "Invalid sender user ID" });
        }

        const me = await User.findById(myId);
        if (!me) return res.status(404).json({ message: "User not found" });

        ensureArray(me, "followRequests");

        me.followRequests = me.followRequests.filter(
            (id) => getId(id) !== senderId.toString()
        );

        await me.save();

        res.json({ message: "Follow request rejected" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFollowRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("followRequests", "fullName profilePic email");

        res.status(200).json(user.followRequests || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelFollowRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver user ID" });
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        ensureArray(receiver, "followRequests");

        receiver.followRequests = receiver.followRequests.filter(
            (id) => getId(id) !== senderId.toString()
        );

        await receiver.save();

        res.status(200).json({ message: "Follow request cancelled" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};