import { prisma } from "../index.ts";
import bcrypt from 'bcryptjs';
// Get all users (admin only)
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                avatarUrl: true,
                lastLogin: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch users"
        });
    }
};
// Get user by ID (admin only)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                avatarUrl: true,
                lastLogin: true,
                createdAt: true,
                projects: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch user"
        });
    }
};
// Create user (admin only)
export const createUser = async (req, res) => {
    try {
        const { email, fullName, password, role = "client" } = req.body;
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User already exists"
            });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                passwordHash,
                role
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create user"
        });
    }
};
// Update user (admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, role } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: {
                fullName,
                role
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                updatedAt: true
            }
        });
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update user"
        });
    }
};
// ✅ ተጠቃሚ ማጥፋት/ማብራት (Toggle user active status)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        // Update user status
        const user = await prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                updatedAt: true
            }
        });
        const status = isActive ? 'activated' : 'deactivated';
        res.json({
            success: true,
            message: `User ${status} successfully`,
            data: user
        });
    }
    catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update user status"
        });
    }
};
// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete user"
        });
    }
};
// Get user statistics (admin only)
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeUsers = await prisma.user.count({
            where: { isActive: true }
        });
        const inactiveUsers = await prisma.user.count({
            where: { isActive: false }
        });
        const newUsersThisMonth = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(1))
                }
            }
        });
        const adminCount = await prisma.user.count({
            where: { role: "admin" }
        });
        const clientCount = await prisma.user.count({
            where: { role: "client" }
        });
        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                newUsersThisMonth,
                adminCount,
                clientCount
            }
        });
    }
    catch (error) {
        console.error("Get user stats error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch user statistics"
        });
    }
};
// ✅ የተጠቃሚዎችን ሁኔታ በጅምላ ማዘመን (Bulk status update)
export const bulkUpdateUserStatus = async (req, res) => {
    try {
        const { userIds, isActive } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Please provide an array of user IDs"
            });
        }
        const result = await prisma.user.updateMany({
            where: {
                id: { in: userIds }
            },
            data: { isActive }
        });
        res.json({
            success: true,
            message: `${result.count} users updated successfully`,
            data: { count: result.count }
        });
    }
    catch (error) {
        console.error("Bulk update error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to bulk update users"
        });
    }
};
