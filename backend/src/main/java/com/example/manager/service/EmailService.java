package com.example.manager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.manager.entity.User;
import com.example.manager.repository.UserRepository;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public void sendVerificationEmail(String toEmail, String verificationCode, String username) {
        // Check if email is configured
        if (fromEmail == null || fromEmail.isEmpty() || "taskmanagerai@gmail.com".equals(fromEmail)) {
            System.out.println("=== EMAIL NOT CONFIGURED - USING CONSOLE ===");
            System.out.println("To: " + toEmail);
            System.out.println("Username: " + username);
            System.out.println("Verification Code: " + verificationCode);
            System.out.println("Please configure your Gmail App Password in application.properties");
            System.out.println("==========================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("TaskManager Pro - Verify Your Email");
            message.setText(buildVerificationEmailBody(username, verificationCode));
            
            mailSender.send(message);
            System.out.println("Verification email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception, allow registration to continue
        }
    }

    private String buildVerificationEmailBody(String username, String verificationCode) {
        return String.format(
            "🎉 Welcome to TaskManager Pro, %s!\n\n" +
            "Thank you for joining TaskManager Pro - your ultimate task management solution!\n\n" +
            "📧 EMAIL VERIFICATION REQUIRED\n" +
            "To complete your registration, please use this verification code:\n\n" +
            "🔐 VERIFICATION CODE: %s\n\n" +
            "⏰ This code will expire in 10 minutes for security purposes.\n\n" +
            "Once verified, you'll be able to:\n" +
            "✅ Create and manage your tasks\n" +
            "✅ Set priorities and due dates\n" +
            "✅ Track your productivity\n\n" +
            "If you didn't create this account, please ignore this email.\n\n" +
            "Happy task managing! 🚀\n\n" +
            "Best regards,\n" +
            "The TaskManager Pro Team\n" +
            "taskmanagerai@gmail.com",
            username, verificationCode
        );
    }

    public void sendTaskReminder(String taskTitle, String taskDescription, String dueDate, Integer hoursUntilDue) {
        // Get current user email
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        
        if (user == null) {
            System.err.println("User not found for task reminder");
            return;
        }

        // Check if email is configured
        if (fromEmail == null || fromEmail.isEmpty() || "taskmanagerai@gmail.com".equals(fromEmail)) {
            System.out.println("=== TASK REMINDER - EMAIL NOT CONFIGURED ===");
            System.out.println("To: " + userEmail);
            System.out.println("Task: " + taskTitle);
            System.out.println("Due in: " + hoursUntilDue + " hours");
            System.out.println("==========================================");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(userEmail);
            message.setSubject("⏰ Task Reminder - " + taskTitle);
            message.setText(buildTaskReminderEmailBody(user.getUsername(), taskTitle, taskDescription, dueDate, hoursUntilDue));
            
            mailSender.send(message);
            System.out.println("Task reminder email sent successfully to: " + userEmail);
        } catch (Exception e) {
            System.err.println("Failed to send task reminder email to " + userEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildTaskReminderEmailBody(String username, String taskTitle, String taskDescription, String dueDate, Integer hoursUntilDue) {
        return String.format(
            "⏰ Task Reminder - TaskManager Pro\n\n" +
            "Hello %s,\n\n" +
            "This is a friendly reminder that one of your tasks is due soon!\n\n" +
            "📋 TASK DETAILS:\n" +
            "Title: %s\n" +
            "Description: %s\n" +
            "Due Date: %s\n" +
            "⏰ Time Remaining: %d hour(s)\n\n" +
            "🚨 Don't forget to complete this task before the deadline!\n\n" +
            "You can manage your tasks by logging into TaskManager Pro.\n\n" +
            "Stay productive! 💪\n\n" +
            "Best regards,\n" +
            "The TaskManager Pro Team\n" +
            "taskmanagerai@gmail.com",
            username, taskTitle, taskDescription, dueDate, hoursUntilDue
        );
    }
}