package com.example.todo.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoItemDTO {
    private Long id;

    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    private Boolean completed;

}
