An interactive web-based grading assistant designed to streamline the grading process by automating repetitive feedback and point deductions. This tool helps educators efficiently manage grading by selecting common errors, automatically calculating grades, and compiling feedback for students.

Currently hosted here: [grading.logan-boehm.com](https://grading.logan-boehm.com).

## Table of Contents

- [Features](#features)
- [Usage](#usage)
  - [Assignment Setup](#assignment-setup)
  - [Managing Common Mistakes](#managing-common-mistakes)
    - [Adding a New Error](#adding-a-new-error)
    - [Editing an Error](#editing-an-error)
    - [Deleting an Error](#deleting-an-error)
    - [Reordering Errors](#reordering-errors)
  - [Grading Process](#grading-process)
  - [Feedback Compilation](#feedback-compilation)
  - [Resetting and Clearing Data](#resetting-and-clearing-data)
- [Persistence](#persistence)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Dynamic Grade Calculation**: Automatically calculates the student's grade based on selected errors.
- **Feedback Compilation**: Aggregates feedback messages from selected errors for easy communication with students.
- **Customizable Error List**: Add, edit, delete, and reorder common mistakes to tailor the tool to your grading needs.
- **Drag-and-Drop Reordering**: Organize errors in order of frequency or importance using a simple drag-and-drop interface.
- **State Persistence**: Saves your error list and selections using `localStorage`, so your data persists across sessions.
- **Copy Feedback**: Quickly copy the compiled feedback to your clipboard for easy pasting into grading portals or documents.

---

## Usage

### Assignment Setup

1. **Set Total Points**

   - At the top of the page, enter the maximum points possible for the assignment in the "Assignment Total Points" field.
   - The default value is **100**.

### Managing Common Mistakes

#### Adding a New Error

1. **Click "Add New Error"**

   - A prompt will appear asking for the error details.

2. **Enter Error Details**

   - **Description**: Provide a brief description of the error (e.g., "Incorrect variable naming").
   - **Point Deduction**: Enter the number of points to deduct (e.g., `5`).
   - **Feedback Message**: Write detailed feedback to help the student understand the mistake.

3. **Submit**

   - The new error will appear in the list of common mistakes.

#### Editing an Error

1. **Click "Edit"**

   - Next to the error you wish to edit, click the "Edit" button.

2. **Modify Error Details**

   - An editable form will appear below the error.
   - Update the description, point deduction, or feedback message as needed.

3. **Save Changes**

   - Click the "Save" button to apply the changes.
   - The error list and calculations will update accordingly.

4. **Cancel Editing**

   - Click the "Cancel" button if you do not wish to save changes.

#### Deleting an Error

1. **Click "Delete"**

   - Next to the error you wish to remove, click the "Delete" button.

2. **Confirm Deletion**

   - A confirmation prompt will appear.
   - Click "OK" to delete or "Cancel" to abort.

#### Reordering Errors

1. **Use Drag-and-Drop**

   - Click and hold the **hamburger icon (☰)** next to an error.
   - Drag the error to the desired position.
   - Release to drop it in place.

2. **Automatic Updates**

   - The order of errors in the feedback area will match the new order.
   - Grade calculations and selections remain intact.

### Grading Process

1. **Select Errors**

   - Check the boxes next to the errors the student made.
   - Each selected error will deduct points from the current grade.

2. **Dynamic Grade Display**

   - The "Current Grade" display will update in real-time based on your selections.

### Feedback Compilation

1. **View Compiled Feedback**

   - The "Feedback" area will automatically include messages from the selected errors.

2. **Edit Feedback (Optional)**

   - You can manually edit the compiled feedback before copying or saving.

3. **Copy Feedback**

   - Click the "Copy" button next to the feedback area to copy the text to your clipboard.

### Resetting and Clearing Data

- **Reset Selections**

  - Click the "Reset" button to uncheck all errors and reset the current grade.
  - This does not delete any errors from your list.

- **Clear All Data**

  - Click the "Clear All Data" button to remove all errors and reset the application.
  - A confirmation prompt will appear to prevent accidental deletion.

---

## Persistence

- The application uses `localStorage` to save your error list and selections.
- Data persists across sessions and page reloads.
- **Note**: Clearing your browser's local storage or clicking "Clear All Data" will erase this information.

---

## Contributing

Contributions are welcome! If you have ideas for new features or improvements, please either add them as an issue or submit a pull request. 

## License

This project is licensed under the [MIT License](LICENSE).

---
