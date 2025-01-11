import express from 'express';
import chatRouter from './chatRouter';
import transRouter from './transRouter';
import authRouter from './authRouter';
import questionRouter from './questionRouter';

const web = express.Router();

web.use('/chat', chatRouter);
web.use('/route', transRouter);
web.use('/auth', authRouter);
web.use('/', questionRouter);

export default web;
