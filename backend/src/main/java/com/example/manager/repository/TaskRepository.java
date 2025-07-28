package com.example.manager.repository;

import com.example.manager.entity.Task;
import com.example.manager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserOrderByCreatedAtDesc(User user);
    List<Task> findByUserAndStatusOrderByCreatedAtDesc(User user, Task.TaskStatus status);
    List<Task> findByUserAndStatusAndReminderSentOrderByCreatedAtDesc(User user, Task.TaskStatus status, boolean reminderSent);
    Optional<Task> findByIdAndUser(Long id, User user);
    long countByUserAndStatus(User user, Task.TaskStatus status);
}