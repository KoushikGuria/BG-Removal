import { Webhook } from "svix";
import userModel from "../models/userModel.js";
//import razorpay from "razorpay";

// API Controller function to manage Clerk user with database
// http://localhost:5000/api/user/webhooks

const clerkWebhooks = async (req, res) => {
    try {
        //Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        const {data, type} = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                }
                await userModel.create(userData);
                //console.log(response);
                res.json({});

                break;
            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                }
                await userModel.findOneAndUpdate({clerkId:data.id}, userData);
                res.json({});

                break;
            }
            case "user.deleted": {
                await userModel.findOneAndDelete({clerkId:data.id});
                res.json({});

                break;
            }
                
            default:
                break;
        }
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}


// API Controller function to get user available credits data
const userCredits = async (req, res) => {
    try {
        const { clerkId } = req.user;

        const userData = await userModel.findOne({ clerkId });
        console.log(userData);

        res.json({ success: true, credits: userData.creditBalance });

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Gateway initialize
// const razorpayInstance = new razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// API to make payment for credits
// const paymentRazorpay = async (req, res) => {
//     try {
//         const { clerkId, planId } = req.body;

//         const userData = await userModel.findOne({ clerkId });

//         if (!userData || !planId) {
//             return res.json({ success: false, message: "Invalid credentials" });
//         }

//         let credits, plan, amount, date;

//         switch (planId) {
//             case 'Basic':
//                 plan = "Basic"
//                 credits = 100
//                 amount = 10
//                 break;

//             case 'Advanced':
//                 plan = "Advanced"
//                 credits = 500
//                 amount = 50
//                 break;

//             case 'Business':
//                 plan = "Business"
//                 credits = 5000
//                 amount = 250
//                 break;
        
//             default:
//                 break;
//         }

//        date = Date.now();

        // Creating Transaction
        // const transactionDate = {
        //     clerkId,
        //     plan,
        //     amount,
        //     credits,
        //     data
        // }


//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message});
//     }
// }


export { clerkWebhooks, userCredits };