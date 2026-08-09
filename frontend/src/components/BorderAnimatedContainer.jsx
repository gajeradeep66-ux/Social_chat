import React from "react";

const BorderAnimatedContainer = ({ children }) => {
    return (
        <div className="
            w-full h-full
            flex
            rounded-2xl
            border border-transparent
            overflow-hidden
            [background:linear-gradient(45deg,#172033,#1e293b_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),rgb(71_85_105/.48)_80%,rgb(6_182_212)_86%,rgb(103_232_249)_90%,rgb(6_182_212)_94%,rgb(71_85_105/.48))_border-box]
            bg-clip-padding
            animate-border
            ">
        {children}
        </div>
    );
};

export default BorderAnimatedContainer;
