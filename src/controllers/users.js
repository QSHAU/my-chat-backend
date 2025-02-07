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
    const existingUser = await User.query().findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким email уже существует!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.query().insert({
      username,
      email,
      password: hashedPassword,
    });

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

export const login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Все поля обязательны!" });
    }
  
    try {
      const user = await User.query().findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Неверный email или пароль!" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Неверный email или пароль!" });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({
        message: "Авторизация успешна!",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера при входе", error });
    }
  };