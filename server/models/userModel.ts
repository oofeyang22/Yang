import mongoose, {Schema} from 'mongoose'

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 8,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

},
{
    timestamps: true
})

const User = mongoose.model('User', UserSchema);
export default User;