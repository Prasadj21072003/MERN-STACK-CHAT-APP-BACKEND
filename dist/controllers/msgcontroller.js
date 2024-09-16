import prisma from "../db/prisma.js";
import { getRecieverSocketId, getRecieverSocket, io, } from "../socket/Socket.js";
export const sendmsg = async (req, res) => {
    try {
        const { message } = req.body;
        const receiverid = req.params.id;
        const senderId = req.user.id;
        let conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, receiverid],
                },
                type: "Personal",
            },
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    type: "Personal",
                    participantIds: {
                        set: [senderId, receiverid],
                    },
                },
            });
        }
        const newmsg = await prisma.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id,
            },
        });
        if (newmsg) {
            conversation = await prisma.conversation.update({
                where: {
                    id: conversation.id,
                },
                data: {
                    message: {
                        connect: {
                            id: newmsg.id,
                        },
                    },
                },
            });
        }
        let msgfromid = senderId;
        const recieverSocketid = getRecieverSocketId(receiverid);
        if (recieverSocketid) {
            io.to(recieverSocketid).emit("newMessage", { newmsg, msgfromid });
        }
        res.json(newmsg);
    }
    catch (error) {
        res.json(error);
    }
};
export const getmsg = async (req, res) => {
    try {
        const receiverid = req.params.id;
        const senderId = req.user.id;
        const conversation = await prisma.conversation.findFirst({
            where: {
                type: "Personal",
                participantIds: {
                    hasEvery: [senderId, receiverid],
                },
            },
            include: {
                message: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
        if (!conversation) {
            return res.json([]);
        }
        res.json(conversation.message);
    }
    catch (error) {
        res.json(error);
    }
};
export const getuserforsidebar = async (req, res) => {
    try {
        const senderId = req.user?.id;
        let data = [];
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: senderId,
                },
            },
            select: {
                id: true,
                fullName: true,
                profilepic: true,
                Conversation: true,
            },
        });
        const groups = await prisma.groups.findMany({
            where: {
                participantIds: {
                    hasEvery: [senderId],
                },
            },
            select: {
                id: true,
                groupname: true,
                participantIds: true,
                conversationId: true,
                conversation: true,
            },
        });
        data = [users, groups];
        res.json(data);
    }
    catch (error) {
        console.log(error);
    }
};
export const makegroup = async (req, res) => {
    try {
        const { mem, input } = req.body;
        let findgroup = await prisma.groups.findFirst({
            where: {
                groupname: input,
            },
        });
        if (findgroup) {
            res?.json("groupname already existed");
        }
        else {
            let conversation = await prisma.conversation.create({
                data: {
                    groupname: input,
                    type: "Group",
                    participantIds: {
                        set: mem?.map((m) => {
                            return m;
                        }),
                    },
                },
            });
            const newgroup = await prisma.groups.create({
                data: {
                    groupname: input,
                    conversationId: conversation.id,
                    participantIds: {
                        set: mem?.map((m) => {
                            return m;
                        }),
                    },
                },
            });
            if (newgroup) {
                res.json({
                    id: newgroup.id,
                    groupname: newgroup.groupname,
                    conversationId: newgroup.id,
                    participantIds: newgroup.participantIds,
                });
            }
            else {
                res.json({ error: "Invalid group data" });
            }
            newgroup?.participantIds.map((m) => {
                const recieverSocket = getRecieverSocket(m);
                if (recieverSocket) {
                    recieverSocket.on("join-room", (input) => recieverSocket.join(input));
                }
            });
        }
    }
    catch (error) {
        res.json("error is " + error);
    }
};
export const sendgroupmsg = async (req, res) => {
    try {
        const { groupname, message, ids } = req.body;
        const senderId = req.user?.id;
        let conversation = await prisma.conversation.findFirst({
            where: {
                groupname: groupname,
                type: "Group",
                participantIds: {
                    hasEvery: ids?.map((m) => {
                        return m;
                    }),
                },
            },
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    groupname: groupname,
                    type: "Group",
                    participantIds: {
                        set: ids?.map((m) => {
                            return m;
                        }),
                    },
                },
            });
        }
        const newmsg = await prisma.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id,
            },
        });
        if (newmsg) {
            conversation = await prisma.conversation.update({
                where: {
                    groupname: groupname,
                    id: conversation.id,
                },
                data: {
                    message: {
                        connect: {
                            id: newmsg.id,
                        },
                    },
                },
            });
        }
        let findgroup = await prisma.groups.findFirst({
            where: {
                groupname: groupname,
            },
        });
        let msgfromid = findgroup?.id;
        console.log(msgfromid);
        io.to(groupname).emit("newMessage", { newmsg });
        findgroup?.participantIds.map((item) => {
            if (item !== senderId) {
                const recieverSocketid = getRecieverSocketId(item);
                if (recieverSocketid) {
                    io.to(recieverSocketid).emit("groupid", { msgfromid });
                }
            }
        });
        console.log(typeof msgfromid);
        res.json(newmsg);
    }
    catch (error) {
        res.json(error);
    }
};
export const getgroupmsg = async (req, res) => {
    try {
        const groupid = req.params.id;
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: groupid,
                type: "Group",
            },
            include: {
                message: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
        if (!conversation) {
            return res.json([]);
        }
        res.json(conversation);
    }
    catch (error) {
        res.json(error);
    }
};
export const clearallmsg = async (req, res) => {
    try {
        const msg = req.params.msg;
        const deletemsg = await prisma.message.deleteMany({
            where: {
                body: {
                    contains: msg,
                },
            },
        });
        res.json("clear");
    }
    catch (error) {
        res.json(error);
    }
};
