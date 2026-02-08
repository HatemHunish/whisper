
import mongoose from 'mongoose';
const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDatabase;