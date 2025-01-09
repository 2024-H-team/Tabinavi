import express from 'express';
import chatRouter from './chatRouter';
import transRouter from './transRouter';

const web = express.Router();

web.use('/chat', chatRouter);
web.use('/route', transRouter);

export default web;
