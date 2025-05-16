package com.example.todo.controller;

import com.example.todo.dto.CreateTodoItemDTO;
import com.example.todo.dto.TodoItemDTO;
import com.example.todo.service.TodoItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TodoItemController {

    private final TodoItemService todoItemService;

    @GetMapping
    public ResponseEntity<List<TodoItemDTO>> getAllTodos(@RequestParam Optional<Boolean> completed) {
        List<TodoItemDTO> todos = todoItemService.getAllTodos(completed);
        return ResponseEntity.ok(todos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoItemDTO> getTodoById(@PathVariable Long id) {
        TodoItemDTO todoItemDTO = todoItemService.getTodoById(id);
        return ResponseEntity.ok(todoItemDTO);
    }

    @PostMapping
    public ResponseEntity<TodoItemDTO> createTodo(@Valid @RequestBody CreateTodoItemDTO createTodoItemDTO) {
        TodoItemDTO createdItem = todoItemService.createTodoItem(createTodoItemDTO);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoItemDTO> updateTodo(@PathVariable Long id, @Valid @RequestBody TodoItemDTO updateDto) {
        TodoItemDTO updatedItem = todoItemService.updateTodoItem(id, updateDto);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoItemService.deleteTodoItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/completed")
    public ResponseEntity<Void> deleteCompletedTodos() {
        todoItemService.deleteCompletedTodoItems();
        return ResponseEntity.noContent().build();
    }
}
