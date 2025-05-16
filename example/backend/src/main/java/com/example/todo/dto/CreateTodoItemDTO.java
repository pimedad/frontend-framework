package com.example.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTodoItemDTO {
    @NotBlank(message = "Title is required for creating a todo.")
    @Size(min = 1, max = 255, message = "Title has to be between 1 and 255 characters.")
    private String title;
}
