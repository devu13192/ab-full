import React from 'react';
import { 
    Alert, 
    AlertTitle, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import { 
    Block, 
    ContactSupport, 
    Close,
    Warning
} from '@mui/icons-material';
import './DeactivationAlert.css';

const DeactivationAlert = ({ open, onClose, userEmail }) => {
    const handleContactSupport = () => {
        // You can customize this to open a contact form or redirect to support
        window.open('mailto:support@eira.com?subject=Account Deactivation Inquiry', '_blank');
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            disableBackdropClick
        >
            <DialogTitle className="deactivation-dialog-title">
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        <Block color="error" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="span">
                            Account Deactivated
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={onClose} 
                        size="small"
                        disabled
                        sx={{ opacity: 0.5 }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Access Restricted</AlertTitle>
                    Your account has been deactivated by an administrator.
                </Alert>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        <strong>What this means:</strong>
                    </Typography>
                    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        <li>You cannot access the platform</li>
                        <li>Your account data is preserved</li>
                        <li>You will receive an email notification</li>
                    </ul>
                    
                    <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                        <strong>Next steps:</strong>
                    </Typography>
                    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        <li>Contact support for more information</li>
                        <li>Wait for administrator to reactivate your account</li>
                        <li>Check your email for detailed information</li>
                    </ul>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button 
                    variant="outlined" 
                    onClick={handleContactSupport}
                    startIcon={<ContactSupport />}
                    color="primary"
                >
                    Contact Support
                </Button>
                <Button 
                    variant="contained" 
                    onClick={onClose}
                    color="primary"
                >
                    I Understand
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeactivationAlert;






