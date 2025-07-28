package com.example.manager.service;

import com.example.manager.dto.AuthResponse;
import com.example.manager.dto.LoginRequest;
import com.example.manager.dto.RegisterRequest;
import com.example.manager.dto.VerifyEmailRequest;
import com.example.manager.dto.ResendCodeRequest;
import com.example.manager.dto.UserResponse;
import com.example.manager.entity.User;
import com.example.manager.repository.UserRepository;
import com.example.manager.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private EmailService emailService;

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid credentials", e);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
        final String token = jwtTokenUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }


        return new AuthResponse(new UserResponse(user), token);
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setVerified(false);
        
        // Generate verification code
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));

        User savedUser = userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), verificationCode, savedUser.getUsername());
            System.out.println("✅ Verification email sent successfully to: " + savedUser.getEmail());
        } catch (Exception e) {
            // If email fails, still return success but log the error
            System.err.println("❌ Failed to send verification email: " + e.getMessage());
            System.out.println("=== EMAIL FAILED - VERIFICATION CODE FOR TESTING ===");
            System.out.println("Email: " + savedUser.getEmail());
            System.out.println("Verification Code: " + verificationCode);
            System.out.println("====================================================");
        }

        // Return response without token (user needs to verify first)
        Map<String, String> response = new HashMap<>();
        return new AuthResponse(new UserResponse(savedUser), "VERIFICATION_REQUIRED");
    }

    public AuthResponse verifyEmail(VerifyEmailRequest verifyRequest) {
        User user = userRepository.findByEmail(verifyRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        if (user.getVerificationCode() == null || 
            !user.getVerificationCode().equals(verifyRequest.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired");
        }

        // Mark user as verified
        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        User savedUser = userRepository.save(user);

        // Generate JWT token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        final String token = jwtTokenUtil.generateToken(userDetails);

        return new AuthResponse(new UserResponse(savedUser), token);
    }

    public void resendVerificationCode(ResendCodeRequest resendRequest) {
        User user = userRepository.findByEmail(resendRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Generate new verification code
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationCode, user.getUsername());
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 1000 + random.nextInt(9000); // Generate 4-digit code
        return String.valueOf(code);
    }
}