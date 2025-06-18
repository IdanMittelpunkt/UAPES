import app from './app.js';
import config from './common/config/external.js';
import { connectDB } from './common/utils/db.js';

// Connect to MongoDB using mongoose
await connectDB();

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});
