import { Contact } from '../schema/contactSchema.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(500).json({ success: false, message: 'Server error, please try again.' });
  }
};
