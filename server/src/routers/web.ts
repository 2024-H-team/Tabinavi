import express from 'express';
import chatRouter from './chatRouter';

const web = express.Router();

web.use('/chat', chatRouter);

export default web;
