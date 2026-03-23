import { prisma } from '../index.ts';
// Get user's notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, unreadOnly = false } = req.query;
        const where = { userId };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }
        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications'
        });
    }
};
// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }
        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({
            success: true,
            data: updated
        });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
};
// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark all notifications as read'
        });
    }
};
// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }
        await prisma.notification.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification'
        });
    }
};
// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.deleteMany({
            where: { userId }
        });
        res.json({
            success: true,
            message: 'All notifications deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete all notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notifications'
        });
    }
};
// Get notification count
export const getNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });
        res.json({
            success: true,
            data: { unreadCount }
        });
    }
    catch (error) {
        console.error('Get notification count error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification count'
        });
    }
};
