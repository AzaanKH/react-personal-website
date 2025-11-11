import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mail, User, MessageSquare } from 'lucide-react';

// Shadcn UI components
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

const ContactFormShadcn = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    alert: { show: false, message: '', type: 'success' }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const showAlert = (message, type = 'success') => {
    setStatus(prev => ({
      ...prev,
      alert: { show: true, message, type }
    }));
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        alert: { ...prev.alert, show: false }
      }));
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prev => ({ ...prev, submitting: true }));

    try {
      // Optional rate limiting check (fail-safe - won't break if it fails)
      let rateLimitMessage = '';
      try {
        const rateLimitResponse = await fetch('/.netlify/functions/rate-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ check: true })
        });

        if (rateLimitResponse.status === 429) {
          const rateLimitResult = await rateLimitResponse.json();
          showAlert(
            rateLimitResult.message || 'Too many submissions. Please wait before trying again.',
            'warning'
          );
          setStatus(prev => ({ ...prev, submitting: false }));
          return;
        }

        // If rate limiting is working, add a note
        if (rateLimitResponse.ok) {
          const rateLimitResult = await rateLimitResponse.json();
          if (rateLimitResult.status === 'active') {
            rateLimitMessage = ' (Protected by rate limiting)';
          }
        }
      } catch (rateLimitError) {
        // Rate limiting failed, but continue with email sending
        if (process.env.NODE_ENV === 'development') {
          console.log('Rate limiting check failed, proceeding anyway:', rateLimitError.message);
        }
      }

      // Send email via EmailJS (always attempt this)
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: 'Azaan Khalfe',
          from_name: formData.from_name,
          from_email: formData.from_email,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('EmailJS Response:', response);
      }
      
      showAlert('Message sent successfully!' + rateLimitMessage, 'success');
      setFormData({ from_name: '', from_email: '', message: '' });
      
      // Close dialog after successful submission
      setTimeout(() => onClose(), 2000);

    } catch (error) {
      console.error('EmailJS Error:', error);
      showAlert('Failed to send message. Please try again later.', 'error');
    } finally {
      setStatus(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Get In Touch
          </DialogTitle>
          <DialogDescription>
            Send me a message and I'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Name Field */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Label htmlFor="from_name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name
            </Label>
            <Input
              id="from_name"
              name="from_name"
              type="text"
              placeholder="Enter your full name"
              value={formData.from_name}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>

          {/* Email Field */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Label htmlFor="from_email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Your Email
            </Label>
            <Input
              id="from_email"
              name="from_email"
              type="email"
              placeholder="Enter your email address"
              value={formData.from_email}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>

          {/* Message Field */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Type your message here..."
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            className="flex gap-2 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Button
              type="submit"
              disabled={status.submitting}
              className="flex-1"
            >
              {status.submitting ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Sending...
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </motion.div>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={status.submitting}
            >
              Cancel
            </Button>
          </motion.div>
        </motion.form>

        {/* Alert Messages */}
        <AnimatePresence>
          {status.alert.show && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Alert
                variant={
                  status.alert.type === 'error' ? 'destructive' :
                  status.alert.type === 'warning' ? 'warning' : 'success'
                }
                className="mt-4"
              >
                <AlertDescription>
                  {status.alert.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormShadcn;