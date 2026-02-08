import mongoose,{Schema,type Document} from "mongoose";
export interface IMessage extends Document {
    chat: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}
const MessageSchema=new Schema<IMessage>({
    chat:{type:Schema.Types.ObjectId,ref:'Chat',required:true},
    sender:{type:Schema.Types.ObjectId,ref:'User',required:true},
    text:{type:String,required:true,trim:true},
},{
    timestamps:true,
});

// index to optimize queries by chat and createdAt
MessageSchema.index({ chat: 1, createdAt: 1}); // oldest messages first
// 1 for ascending order, -1 for descending order
export const MessageModel=mongoose.model<IMessage>('Message',MessageSchema);