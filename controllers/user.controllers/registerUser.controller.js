import User from "../../models/user.model.js";

const registerUserController = async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if the user already exists
        const userExists = await User.findOne({ email }).select("email").lean();
        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        // Create a new user
        const newUser = new User({
            name,
            username,
            email,
            password,
        });

        // Save the user
        const savedUser = await newUser.save();

        // Prepare the response by excluding the hashed secret -
        // - and password and adding the unhashed secret
        const responseUser = {
            name: savedUser.name,
            username: savedUser.username,
            email: savedUser.email,
            clientId: savedUser.credentials.clientId,
            _unhashedClientSecret: savedUser._unhashedSecret,
        };

        // Send the response
        res.status(201).json(responseUser);
    } catch (error) {
        console.error("registerUserController ", error);
        next(error);
    }
};

export default registerUserController;
