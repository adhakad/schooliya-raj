'use strict';
const bcrypt = require('bcrypt');
const tokenService = require('../../services/admin-token');
const AdminUserModel = require('../../models/users/admin-user');
const SchoolKeyModel = require('../../models/users/school-key');

let LoginAdmin = async (req, res, next) => {
    try {
        let admin = await AdminUserModel.findOne({ email: req.body.email });
        if (!admin) {
            return res.status(404).json({ errorMsg: 'Username or password invalid !' });
        }
        const passwordMatch = await bcrypt.compare(req.body.password, admin.password);

        if (!passwordMatch) {
            return res.status(404).json({ errorMsg: 'Username or password invalid !' });
        }
        if (admin.status == "Inactive") {
            return res.status(400).json({ errorMsg: 'Application access permissions denied, please contact app development company !' });
        }
        if (admin.status == "Active") {
            const payload = { id: admin._id, email: admin.email };
            const accessToken = await tokenService.getAccessToken(payload);
            const refreshToken = await tokenService.getRefreshToken(payload);
            return res.status(200).json({ adminInfo: admin, accessToken, refreshToken });
        }
        return res.status(400).json({ errorMsg: 'Login error !' })
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

let RefreshToken = async (req, res, next) => {
    try {
        const { token } = req.body
        if (token) {
            const payload = await tokenService.verifyRefreshToken(token)
            const accessToken = await tokenService.getAccessToken(payload)
            res.send({ accessToken })
        }
        else {
            res.status(403).send('token Unavailable!!')
        }
    } catch (err) {
        res.status(500).json(err)
    }
}

let SignupAdmin = async (req, res, next) => {
    const { email, password, productKey } = req.body;
    try {
        const checkProductKey = await SchoolKeyModel.findOne({ status: 'Inactive' });
        if (!checkProductKey) {
            return res.status(400).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
        }
        const isProductKey = checkProductKey.productKey;
        const productKeyMatch = await bcrypt.compare(productKey, isProductKey);
        if (!productKeyMatch) {
            return res.status(404).json({ errorMsg: 'Product key is invalid !' });
        }
        let countAdmin = await AdminUserModel.count();
        if (countAdmin === 1) {
            return res.status(400).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
        }
        const checkUser = await AdminUserModel.findOne({ email: email });
        if (checkUser) {
            return res.status(400).json({ errorMsg: "Username already exist !" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let adminData = {
            email: email,
            password: hashedPassword,
            status: 'Active',
        }
        const objectId = checkProductKey._id;
        let productKeyStatus = {
            status: 'Active',
        }
        const updateProductKeyStatus = await SchoolKeyModel.findByIdAndUpdate(objectId, { $set: productKeyStatus }, { new: true });
        if (updateProductKeyStatus) {
            const createSignupAdmin = await AdminUserModel.create(adminData);
            if (createSignupAdmin) {
                return res.status(200).json({ successMsg: 'Admin register successfully.' });
            }
        }
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

let VarifyForgotAdmin = async (req, res, next) => {
    const { productKey } = req.body;
    const varifiedAdminInfo = {
        productKey: productKey
    }
    try {
        let countAdmin = await AdminUserModel.count();
        if (countAdmin === 1) {
            let checkAdmin = await AdminUserModel.findOne({ status: 'Active' });
            if (!checkAdmin) {
                return res.status(404).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
            }
            const checkProductKey = await SchoolKeyModel.findOne({ status: 'Active' });
            if (!checkProductKey) {
                return res.status(400).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
            }
            const isProductKey = checkProductKey.productKey;
            const productKeyMatch = await bcrypt.compare(productKey, isProductKey);
            if (!productKeyMatch) {
                return res.status(404).json({ errorMsg: 'Product key is invalid !' });
            }
            if (productKeyMatch) {
                return res.status(200).json({ varifiedAdminInfo: varifiedAdminInfo });
            }
        }
        return res.status(404).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let ResetForgotAdmin = async (req, res, next) => {
    const { productKey, email, password } = req.body;
    try {
        let checkAdmin = await AdminUserModel.findOne({ status: 'Active' });
        if (!checkAdmin) {
            return res.status(404).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
        }
        const checkProductKey = await SchoolKeyModel.findOne({ status: 'Active' });
        if (!checkProductKey) {
            return res.status(400).json({ errorMsg: "Application access permissions denied, please contact app development company !" });
        }
        const isProductKey = checkProductKey.productKey;
        const productKeyMatch = await bcrypt.compare(productKey, isProductKey);
        if (!productKeyMatch) {
            return res.status(404).json({ errorMsg: 'Product key is invalid !' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const resetAdminUserInfo = {
            email: email,
            password: hashedPassword,
            status: 'Active',

        }
        const objectId = checkAdmin._id;
        const updateAdminUser = await AdminUserModel.findByIdAndUpdate(objectId, { $set: resetAdminUserInfo }, { new: true });
        if (updateAdminUser) {
            return res.status(200).json({ successMsg: 'Username and password reset successfully.' });
        }
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

module.exports = {
    LoginAdmin,
    RefreshToken,
    SignupAdmin,
    VarifyForgotAdmin,
    ResetForgotAdmin,
}