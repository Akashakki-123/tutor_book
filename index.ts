///      ॐ 卐 ॐ      ॐ 卐 ॐ      ॐ 卐 ॐ      श्री गणेश      ॐ 卐 ॐ      ॐ 卐 ॐ      ॐ 卐 ॐ      ///

import { createServer } from 'http';
import { config } from 'dotenv';
import app from './app.js';

config();

const server = createServer(app);
const port = process.env.APPID || process.env.PORT || 8000;

try {
  server.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });

  server.on('error', (err: Error) => {
    console.log(err);
  });
} catch (error) {
  console.log(error);
}

///      ॐ 卐 ॐ      ॐ 卐 ॐ      ॐ 卐 ॐ      श्री गणेश      ॐ 卐 ॐ      ॐ 卐 ॐ      ॐ 卐 ॐ      ///
