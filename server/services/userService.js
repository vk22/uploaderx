const fs = require("fs");
const config = require("../config/config");
const rootDir = process.env.ROOT_DIR;
const uploadDir =  rootDir + "/uploads";
const User = require("../models/user-model");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;

class UserService {
    constructor() {
        this.oauth2Client = null;
    }
    async registration(userData, refreshToken, tokens) {
        try {
            const { id, name, picture, email } = userData
            const userNew = {
                id: id,
                username: name,
                email: email,
                picture: picture,
                comment: "",
                uploads: [],
                plan: 'basic',
                refreshToken: refreshToken,
                tokens: tokens
            };
            const newUser = new User(userNew);
            const user = await newUser.save();
            /// create user folder
            await this.createUserFolder(id)
            return { success: true, message: "Successful created new user.", user: user };
        } catch (error) {
            console.log(error.message)
        }
    }
    async login(userData, refreshToken, tokens) {
        const { id } = userData;
        
        console.log('login login ', this)
        try {  
            /// check user
            const candidate = await User.findOne({ id: id });
            if (candidate) {
                candidate.refreshToken = refreshToken;
                candidate.tokens = tokens
                candidate.save();
                await this.createUserFolder(id)
                return { success: true, message: "User exist. User login." }; 
            } else {
                const user = await this.registration(userData, refreshToken)
                return { success: true, user: user };
            }


        } catch (error) {
            console.log(error.message)
        }

    }

    async logout(id) {
        console.log('logout ', id)
        try {
            const user = await User.findOne({ id: id })
            user.refreshToken = ''
            user.save();
            return { success: true, message: "User logout" };

        } catch (error) {
             console.log(error.message)
        }
    }

    async getToken(code) {
        try {
            console.log("code ", code);
            if (code) {
                const clientSecret = process.env.CLIENT_SECRET;
                const clientId = process.env.CLIENT_ID;
                const redirectUrl = 'postmessage';
                const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
                
                /// get tokens
                const { tokens } = await oauth2Client.getToken(code)
                oauth2Client.setCredentials(tokens);

                // console.log('oauth2Client ', oauth2Client)

                /// get user info
                const oauth2 = google.oauth2({
                    auth: oauth2Client,
                    version: 'v2'
                });
                const { data } = await oauth2.userinfo.get();    // get user info
                const userInfo = data;
                console.log('userInfo ', userInfo);

                /// user login
                await this.login(userInfo, tokens.refresh_token, tokens)
                
                // save refresh token
                // await this.saveToken(userInfo.id, tokens.refresh_token)

                // return user
                return userInfo
            }
        } catch (e) {
            console.log("getrefreshtoken ", e);
        }
    }

    async saveToken(userId, refreshToken, tokens) {
        const user = await User.findOne({id: userId})
        if (user) {
            user.refreshToken = refreshToken;
            user.tokens = tokens
            return user.save();
        } else {
            return false;
        }
    }

    async getUserTokens(userID) {
        console.log('getUserTokens ', userID)
        const user = await User.findOne({id: userID})
        console.log('getUserTokens user', user)
        if (user) {
            const tokens = user.tokens
            if (tokens) {
                /// check expire
                const now = Date.now()
                const diff = tokens.expiry_date - now
                console.log('diff ', diff)
                if (diff > 60000) {
                    return tokens
                } else {
                    const newTokens = await this.refreshToken(tokens)
                    console.log('newTokens ', newTokens)
                    if (newTokens.success) {
                        /// user save new tokens
                        await this.saveToken(userID, newTokens.tokens.refresh_token, newTokens.tokens)
                        return newTokens.tokens
                    }
                }
            } else {
                const newTokens = await this.refreshToken(tokens)
                console.log('newTokens ', newTokens)
                if (newTokens.success) {
                    /// user save new tokens
                    await this.saveToken(userID, newTokens.tokens.refresh_token, newTokens.tokens)
                    return newTokens.tokens
                }
            }

            
        } else {
            return false;
        }
    }

    async refreshToken(tokens) {
        try {
            console.log("refreshtoken: " + tokens.refresh_token);
            if (tokens) {
                const clientSecret = process.env.CLIENT_SECRET;
                const clientId = process.env.CLIENT_ID;
                const redirectUrl = process.env.REDIRECT_URIS;
                var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
                oauth2Client.credentials = tokens;
                const data = await oauth2Client.refreshAccessToken()
                return ({
                    success: true,
                    tokens: data.credentials,
                });

                // oauth2Client.refreshAccessToken(function (err, tokens) {
                //     // your access_token is now refreshed and stored in oauth2Client
                //     // store these new tokens in a safe place (e.g. database)
                //     console.log("refreshAccessToken", tokens);
                //     return ({
                //         success: true,
                //         tokens: tokens,
                //     });
                // });
            } else {
                return ({
                    success: false,
                    message: "no token",
                });
            }
        } catch (e) {
            console.log("refreshtoken ", e);
        }
    };

    async createUserFolder(userID) {
        try {
            if (!fs.existsSync(`${uploadDir}/${userID}`)) {
                fs.mkdirSync(`${uploadDir}/${userID}`);
            }
            return true;
        } catch (error) {
            console.log('createUserFolder error ', error.message)
            return error.message;
        }
    }

    async getAllUsers() {
        const users = await User.find();
        return users;
    }
}

module.exports = new UserService();