import express from 'express';
import chatRouter from './chatRouter';
import transRouter from './transRouter';
import authRouter from './authRouter';

const web = express.Router();

web.use('/chat', chatRouter);
web.use('/route', transRouter);
web.use('/auth', authRouter);

export default web;
