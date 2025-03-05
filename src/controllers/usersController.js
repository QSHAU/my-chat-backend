import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Token from "../models/Tokens.js";

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.access_token_expiration,
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
        expiresIn: process.env.refresh_token_expiration,
    });
};

// Регистрация пользователя
export const create = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Все поля обязательны!" });
    }

    try {
        const existingUser = await User.query().findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Пользователь с таким email уже существует!",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.query().insert({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Пользователь успешно зарегистрирован!",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Ошибка сервера при регистрации",
            error,
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Все поля обязательны!" });
    }
    try {
        const user = await User.query().findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Неверный email или пароль!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Неверный email или пароль!" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        const user_token = await Token.query().insert({
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!user_token) throw new Error('An unexpected error has occurred');

        await User.query()
            .patch({ refresh_token: refreshToken })
            .where({ id: user.id });

        if (!accessToken && !refreshToken) throw new Error("Токены не созданы");
        res.cookie("refreshToken", refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });

        res.status(200).json({
            message: "Авторизация успешна!",
            accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера при входе", error });
    }
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.headers.cookie.replace("refreshToken=", "");
		await Token.query()
			.findOne({
				refresh_token: refreshToken,
			})
			.delete();
		res.clearCookie('refreshToken');
		return res.json({
			success: true,
		});
	} catch (e) {
		return res.json({
			success: false,
			message: e.message || e,
		});
	}
};

export const isAuth = async (req, res) => {
    try {
		const bearerHeader = req.headers['authorization'];

		if (!bearerHeader) throw new Error('An unexpected error has occurred');
		
		const access_token = bearerHeader?.split(/\s/)[1];
		const user_token = await Token.query().findOne({
			access_token,
		});

		if (!user_token) throw new Error('An unexpected error has occurred');

		const user = await User.query().findOne({
			id: user_token.user_id,
		});

		if (!user) throw new Error('An unexpected error has occurred');

		await generateAccessToken(user);

		await res.json({
			success: true,
		});
	} catch (e) {
		await res.json({
			success: false,
			message: e.message || e,
		});
	}
}

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.headers.cookie.replace("refreshToken=", "");

        if (!refreshToken) {
            return res.status(403).json({ error: "Refresh token отсутствует" });
        }

        const user = await User.query().findOne({
            refresh_token: refreshToken,
        });
        if (!user) {
            return res
                .status(403)
                .json({ error: "Недействительный refresh token" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
            if (err)
                return res
                    .status(403)
                    .json({ error: "Недействительный refresh token" });

            const newAccessToken = generateAccessToken(user);
            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

export const searchUser = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;
        
        if (!query) return res.json([]);

        const users = await User.query()
            .where("id", "!=", userId) // Исключаем себя
            .andWhere((qb) => {
                qb.where("username", "like", `%${query}%`)
                  .orWhere("email", "like", `%${query}%`);
            })
            .select("id", "username", "email");

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при поиске пользователей" });
    }
}