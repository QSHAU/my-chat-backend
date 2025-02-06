import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Регистрация пользователя
export const create = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Все поля обязательны!" });
  }

  try {
    // Проверяем, если пользователь с таким email уже существует
    const existingUser = await User.query().findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким email уже существует!" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = await User.query().insert({
      username,
      email,
      password: hashedPassword,
    });

    // Генерируем JWT токен
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован!",
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при регистрации", error });
  }
};
