package com.example.todo.service;

import com.example.todo.dto.CreateTodoItemDTO;
import com.example.todo.dto.TodoItemDTO;
import com.example.todo.exception.InvalidInputException;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.model.TodoItem;
import com.example.todo.repository.TodoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TodoItemService {

    private final TodoItemRepository todoItemRepository;

    public List<TodoItemDTO> getAllTodos(Optional<Boolean> completedOpt) {
        List<TodoItem> items;
        if (completedOpt.isPresent()) {
            items = todoItemRepository.findByCompleted(completedOpt.get());
        } else {
            items = todoItemRepository.findAll();
        }
        return items.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TodoItemDTO getTodoById(Long id) {
        return todoItemRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new ResourceNotFoundException("TodoItem not found with id: " + id));
    }

    public TodoItemDTO createTodoItem(CreateTodoItemDTO createDto) {
        TodoItem todoItem = new TodoItem();
        todoItem.setTitle(createDto.getTitle().trim());
        todoItem.setCompleted(false);
        TodoItem savedItem = todoItemRepository.save(todoItem);
        return convertToDto(savedItem);
    }

    @Transactional
    public TodoItemDTO updateTodoItem(Long id, TodoItemDTO updateDto) {
        if (updateDto.getId() != null && !updateDto.getId().equals(id)) {
            throw new InvalidInputException("ID in path (" + id + ") does not match ID in request body (" + updateDto.getId() + ").");
        }

        TodoItem existingItem = todoItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TodoItem not found with id: " + id + " for update."));

        if (updateDto.getTitle() != null) {
            String trimmedTitle = updateDto.getTitle().trim();
            if (trimmedTitle.isEmpty()) {
                throw new InvalidInputException("Title cannot be empty when provided for an update.");
            }
            existingItem.setTitle(trimmedTitle);
        }

        if (updateDto.getCompleted() != null) {
            existingItem.setCompleted(updateDto.getCompleted());
        }

        TodoItem updatedItem = todoItemRepository.save(existingItem);
        return convertToDto(updatedItem);
    }

    @Transactional
    public void deleteTodoItem(Long id) {
        if (!todoItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("TodoItem not found with id: " + id + " for deletion.");
        }
        todoItemRepository.deleteById(id);
    }

    @Transactional
    public void deleteCompletedTodoItems() {
        todoItemRepository.deleteByCompleted(true);
    }

    private TodoItemDTO convertToDto(TodoItem item) {
        return new TodoItemDTO(item.getId(), item.getTitle(), item.isCompleted());
    }
}
