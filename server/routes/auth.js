const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

// ─── SIGNUP ───────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ detail: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    )

    res.status(201).json({ message: 'Account created successfully' })
  } catch (err) {
    res.status(500).json({ detail: err.message })
  }
})

// ─── LOGIN ────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    if (result.rows.length === 0) {
      return res.status(400).json({ detail: 'Invalid email or password' })
    }

    const user = result.rows[0]

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ detail: 'Invalid email or password' })
    }

    const accessToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.id, refreshToken]
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    res.status(500).json({ detail: err.message })
  }
})

// ─── REFRESH ──────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken

  if (!token) {
    return res.status(401).json({ detail: 'No refresh token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2',
      [token, decoded.id]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'Invalid refresh token' })
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    )
    const user = userResult.rows[0]

    const accessToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    res.status(401).json({ detail: 'Invalid refresh token' })
  }
})

// ─── LOGOUT ───────────────────────────────────────
router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken

  if (token) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [token]
    )
  }

  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
})

module.exports = router