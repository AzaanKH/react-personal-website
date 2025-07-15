import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ContactForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    alert: { open: false, message: '', severity: 'success' }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
          setStatus({
            submitting: false,
            alert: {
              open: true,
              message: rateLimitResult.message || 'Too many submissions. Please wait before trying again.',
              severity: 'warning'
            }
          });
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
        console.log('Rate limiting check failed, proceeding anyway:', rateLimitError.message);
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

      console.log('EmailJS Response:', response);
      
      setStatus({
        submitting: false,
        alert: {
          open: true,
          message: 'Message sent successfully!' + rateLimitMessage,
          severity: 'success'
        }
      });

      setFormData({ from_name: '', from_email: '', message: '' });
      setTimeout(() => onClose(), 2000);

    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus({
        submitting: false,
        alert: {
          open: true,
          message: 'Failed to send message. Please try again later.',
          severity: 'error'
        }
      });
    }
  };

  const handleCloseAlert = () => {
    setStatus(prev => ({
      ...prev,
      alert: { ...prev.alert, open: false }
    }));
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'var(--card-bg)',
          color: 'var(--bs-body-color)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }
      }}
      TransitionComponent={motion.div}
      TransitionProps={{
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: { duration: 0.3 }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 0,
        position: 'relative',
        color: 'var(--heading-color)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Get In Touch
        </motion.div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'var(--bs-body-color)',
          }}
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <CloseIcon />
          </motion.div>
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 2,
          }}
        >
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <TextField
              fullWidth
              label="Your Name"
              name="from_name"
              value={formData.from_name}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'var(--bs-body-color)',
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--bs-body-color)',
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#007bff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007bff',
                  },
                },
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <TextField
              fullWidth
              label="Your Email"
              name="from_email"
              type="email"
              value={formData.from_email}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'var(--bs-body-color)',
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--bs-body-color)',
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#007bff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007bff',
                  },
                },
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <TextField
              fullWidth
              label="Message"
              name="message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'var(--bs-body-color)',
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--bs-body-color)',
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#007bff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007bff',
                  },
                },
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status.submitting}
              sx={{
                mt: 2,
                py: 1.5,
                bgcolor: '#007bff',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0056b3',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {status.submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </motion.div>
        </Box>
      </DialogContent>

      <AnimatePresence>
        {status.alert.open && (
          <Snackbar
            open={status.alert.open}
            autoHideDuration={6000}
            onClose={handleCloseAlert}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Alert
                onClose={handleCloseAlert}
                severity={status.alert.severity}
                variant="filled"
              >
                {status.alert.message}
              </Alert>
            </motion.div>
          </Snackbar>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ContactForm;