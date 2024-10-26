// static/js/script.js
$(document).ready(function () {
    let errors = []; // Master error list
    let students = []; // List of students
    let selectedStudent = null; // Currently selected student
    let totalPoints = 100;
    let currentGrade = totalPoints;
    let errorIdCounter = 0;

    function generateUniqueId() {
        return 'error-' + errorIdCounter++;
    }

    // Load saved data from localStorage when the page loads
    function loadData() {
        // Load errors
        const savedErrors = localStorage.getItem('errors');
        if (savedErrors) {
            errors = JSON.parse(savedErrors);
            // Update errorIdCounter
            errors.forEach(function (error) {
                const idNum = parseInt(error.id.split('-')[1]);
                if (!isNaN(idNum) && idNum >= errorIdCounter) {
                    errorIdCounter = idNum + 1;
                }
            });
        }

        // Load total points
        const savedTotalPoints = localStorage.getItem('totalPoints');
        if (savedTotalPoints) {
            totalPoints = parseFloat(savedTotalPoints);
            $('#totalPoints').val(totalPoints);
        }

        // Load students
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            students = JSON.parse(savedStudents);
            console.log(students);
        }

        // Load selected student ID
        const savedStudentId = localStorage.getItem('selectedStudentId');
        selectedStudent = students.find(s => s.id === savedStudentId) || students[0] || null;

        // Render errors and update grade
        renderErrors();
        updateGradeAndFeedback();
        renderStudents();
    }

    // Function to save data to localStorage
    function saveData() {
        localStorage.setItem('errors', JSON.stringify(errors));
        localStorage.setItem('totalPoints', totalPoints);

        // Save students
        localStorage.setItem('students', JSON.stringify(students));
        if (selectedStudent) {
            localStorage.setItem('selectedStudentId', selectedStudent.id);
        } else {
            localStorage.removeItem('selectedStudentId');
        }
    }

    function renderStudents() {
        const $studentSelect = $('#studentSelect');
        $studentSelect.empty();
        students.forEach(function (student) {
            const option = $('<option>').val(student.id).text(student.name);
            $studentSelect.append(option);
        });
        if (selectedStudent) {
            $studentSelect.val(selectedStudent.id);
        }
    }

    // Function to update grade and feedback
    function updateGradeAndFeedback() {
        if (!selectedStudent) {
            $('#currentGrade').text(totalPoints.toFixed(2));
            $('#maxPoints').text(totalPoints.toFixed(2));
            $('#feedbackArea').val('');
            return;
        }

        currentGrade = totalPoints;
        let feedbacks = [];
        selectedStudent.selectedErrors.forEach(function (errorId) {
            const error = errors.find(e => e.id === errorId);
            if (error) {
                currentGrade -= error.points;
                if (error.points > 0) {
                    feedbacks.push(error.feedback + ` (-${error.points} points)\n`);
                } else {
                    feedbacks.push(error.feedback + '\n');
                }
            }
        });
        if (currentGrade < 0) currentGrade = 0;
        $('#currentGrade').text(currentGrade.toFixed(2));
        $('#maxPoints').text(totalPoints.toFixed(2));
        $('#feedbackArea').val(feedbacks.join('\n'));

        saveData();
    }



    // Function to render errors list
    function renderErrors() {
        $('#errorsList').empty();
        errors.forEach(function (error) {
            const isChecked = selectedStudent && selectedStudent.selectedErrors.includes(error.id);
            const errorHtml = `
                <div class="error-item" data-id="${error.id}">
                    <div class="d-flex align-items-center">
                        <span class="drag-handle mr-2">&#9776;</span>
                        <input type="checkbox" id="${error.id}" data-id="${error.id}" ${isChecked ? 'checked' : ''}>
                        <!-- <input type="checkbox" id="${error.id}" data-id="${error.id}" ${error.selected ? 'checked' : ''}> -->
                        <label for="${error.id}" class="mb-0 ml-2">
                            ${error.description} (-${error.points} points)
                        </label>
                        <button class="btn btn-sm btn-warning ml-auto edit-error-btn" data-id="${error.id}">Edit</button>
                        <button class="btn btn-sm btn-danger ml-2 delete-error-btn" data-id="${error.id}"><i class="fa fa-trash-o"></i></button>
                    </div>
                    <!-- Collapsible Edit Form -->
                    <div class="edit-form mt-2" style="display: none;">
                        <div class="form-group">
                            <label>Description:</label>
                            <input type="text" class="form-control edit-description" value="${error.description}">
                        </div>
                        <div class="form-group">
                            <label>Point Deduction:</label>
                            <input type="number" class="form-control edit-points" value="${error.points}">
                        </div>
                        <div class="form-group">
                            <label>Feedback Message:</label>
                            <textarea class="form-control edit-feedback" rows="2">${error.feedback}</textarea>
                        </div>
                        <button class="btn btn-primary save-error-btn" data-id="${error.id}">Save</button>
                        <button class="btn btn-secondary cancel-edit-btn" data-id="${error.id}">Cancel</button>
                    </div>
                </div>
            `;
            $('#errorsList').append(errorHtml);
        });

        // Re-initialize Sortable after rendering
        initializeSortable();
    }

    // Initialize SortableJS
    function initializeSortable() {
        if (window.sortable) {
            // Destroy previous instance
            sortable.destroy();
        }
        sortable = new Sortable(document.getElementById('errorsList'), {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function (evt) {
                // Update the errors array based on the new order
                let newOrder = [];
                $('#errorsList .error-item').each(function () {
                    const id = $(this).data('id');
                    const error = errors.find(e => e.id === id);
                    if (error) {
                        newOrder.push(error);
                    }
                });
                errors = newOrder;
                // Save the new order
                saveData();
                // Update grade and feedback
                updateGradeAndFeedback();
            }
        });
    }

    function generateErrorsReport() {
        // Collect all errors that students have made
        let errorOccurrences = {};

        students.forEach(function (student) {
            student.selectedErrors.forEach(function (errorId) {
                if (!errorOccurrences[errorId]) {
                    errorOccurrences[errorId] = {
                        count: 0,
                        error: errors.find(e => e.id === errorId)
                    };
                }
                errorOccurrences[errorId].count += 1;
            });
        });

        // Build the report content
        let reportContent = '';
        for (let errorId in errorOccurrences) {
            const errorData = errorOccurrences[errorId];
            const error = errorData.error;
            const description = error.description;
            const pointsOff = error.points;
            const feedback = error.feedback;
            const occurrenceCount = errorData.count;

            reportContent += `${description} (-${pointsOff} Points Deducted)\n`;
            reportContent += '------------------------------------------------\n';
            reportContent += `${feedback}\n\n`;
        }

        // Trigger download of the report
        downloadTextFile(reportContent, 'Errors_Report.txt');
    }

    function generateStudentReports() {
        let reportContent = '';

        students.forEach(function (student) {
            reportContent += `${student.name}\n`;
            reportContent += '------------------------------\n';

            let studentGrade = totalPoints;
            student.selectedErrors.forEach(function (errorId) {
                const error = errors.find(e => e.id === errorId);
                if (error) {
                    const description = error.description;
                    const pointsOff = error.points;
                    const feedback = error.feedback;

                    studentGrade -= pointsOff;

                    reportContent += `${description} : -${pointsOff} points\n`;
                    reportContent += `${feedback}\n<br>\n`;
                }
            });

            reportContent += `Total Grade: ${studentGrade.toFixed(2)} / ${totalPoints}\n\n`;
        });

        // Trigger download of the report
        downloadTextFile(reportContent, 'Student_Reports.txt');
    }

    function downloadTextFile(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        if (window.navigator.msSaveOrOpenBlob) {
            // For IE browser
            window.navigator.msSaveBlob(blob, fileName);
        } else {
            // For other browsers
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;

            // Append to the DOM to initiate the download
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
        }
    }

    function removeStudent() {
        if (!selectedStudent) {
            alert('No student selected to remove.');
            return;
        }

        if (confirm(`Are you sure you want to remove ${selectedStudent.name}? This action cannot be undone.`)) {
            // Remove the student from the students array
            const index = students.findIndex(s => s.id === selectedStudent.id);
            if (index !== -1) {
                students.splice(index, 1);
            }

            // If there are students left, select the first one
            if (students.length > 0) {
                selectedStudent = students[0];
            } else {
                // No students left, clear the selection
                selectedStudent = null;
            }

            // Update the UI
            renderStudents();
            renderErrors();
            updateGradeAndFeedback();
            saveData();
        }
    }



    // Event listener for adding new error
    $('#addError').click(function () {
        const description = prompt('Enter error description:');
        if (description) {
            const points = parseFloat(prompt('Enter point deduction:'));
            if (!isNaN(points)) {
                const feedback = prompt('Enter feedback message:');
                errors.push({
                    id: generateUniqueId(),
                    description: description,
                    points: points,
                    feedback: feedback,
                    selected: false
                });
                renderErrors();
                updateGradeAndFeedback();
            } else {
                alert('Invalid point deduction value.');
            }
        }
    });

    $('#errorsList').on('change', 'input[type="checkbox"]', function () {
        const id = $(this).data('id');
        if (!selectedStudent) {
            alert('Please select a student first.');
            $(this).prop('checked', false);
            return;
        }
        const isChecked = $(this).is(':checked');
        if (isChecked) {
            if (!selectedStudent.selectedErrors.includes(id)) {
                selectedStudent.selectedErrors.push(id);
            }
        } else {
            const index = selectedStudent.selectedErrors.indexOf(id);
            if (index !== -1) {
                selectedStudent.selectedErrors.splice(index, 1);
            }
        }
        updateGradeAndFeedback();
        saveData();
    });


    // Event listener for delete error button
    $('#errorsList').on('click', '.delete-error-btn', function () {
        const id = $(this).data('id');
        const index = errors.findIndex(e => e.id === id);
        if (index !== -1 && confirm('Are you sure you want to delete this error?')) {
            errors.splice(index, 1);
            // Remove error from all students
            students.forEach(function (student) {
                const errorIndex = student.selectedErrors.indexOf(id);
                if (errorIndex !== -1) {
                    student.selectedErrors.splice(errorIndex, 1);
                }
            });
            renderErrors();
            updateGradeAndFeedback();
            saveData();
        }
    });


    // Event listener for edit error button
    $('#errorsList').on('click', '.edit-error-btn', function () {
        const $errorItem = $(this).closest('.error-item');
        const $editForm = $errorItem.find('.edit-form');
        $editForm.slideDown();
    });

    // Event listener for save error button
    $('#errorsList').on('click', '.save-error-btn', function () {
        const $errorItem = $(this).closest('.error-item');
        const id = $errorItem.data('id');
        const error = errors.find(e => e.id === id);
        if (error) {
            const newDescription = $errorItem.find('.edit-description').val().trim();
            const newPoints = parseFloat($errorItem.find('.edit-points').val());
            const newFeedback = $errorItem.find('.edit-feedback').val().trim();

            if (newDescription && !isNaN(newPoints)) {
                error.description = newDescription;
                error.points = newPoints;
                error.feedback = newFeedback;
                renderErrors();
                updateGradeAndFeedback();
            } else {
                alert('Please enter a valid description and point deduction.');
            }
        }
    });

    // Event listener for cancel edit button
    $('#errorsList').on('click', '.cancel-edit-btn', function () {
        const $errorItem = $(this).closest('.error-item');
        const $editForm = $errorItem.find('.edit-form');
        $editForm.slideUp();
    });

    // Event listener for total points change
    $('#totalPoints').on('input', function () {
        totalPoints = parseFloat($(this).val()) || 0;
        updateGradeAndFeedback();
    });

    // Reset Button
    $('#resetBtn').click(function () {
        if (selectedStudent) {
            selectedStudent.selectedErrors = [];
            renderErrors();
            updateGradeAndFeedback();
            saveData();
        }
    });

    // Clear All Data Button
    $('#clearDataBtn').click(function () {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            errors = [];
            students = [];
            selectedStudent = null;
            totalPoints = 100;
            $('#totalPoints').val(totalPoints);
            errorIdCounter = 0;
            renderStudents();
            renderErrors();
            updateGradeAndFeedback();
        }
    });


    // Event listener for copy feedback button
    $('#copyFeedbackBtn').click(function () {
        const feedbackText = $('#feedbackArea').val();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(feedbackText).then(function () {
                $('#copyFeedbackBtn').text('Copied!');
                setTimeout(function () {
                    $('#copyFeedbackBtn').text('Copy');
                }, 2000);
            }, function (err) {
                console.error('Clipboard API failed: ', err);
            });
        } else {
            $('#feedbackArea').select();
            document.execCommand('copy');
            $('#copyFeedbackBtn').text('Copied!');
            setTimeout(function () {
                $('#copyFeedbackBtn').text('Copy');
            }, 2000);
        }
    });

    // Add Student
    $('#addStudentBtn').click(function () {
        const name = prompt('Enter student name:');
        if (name) {
            const student = {
                id: 'student-' + Date.now(),
                name: name,
                selectedErrors: []
            };
            students.push(student);
            selectedStudent = student;
            renderStudents();
            renderErrors();
            updateGradeAndFeedback();
            saveData();
        }
    });

    // Select Student
    $('#studentSelect').change(function () {
        const studentId = $(this).val();
        selectedStudent = students.find(s => s.id === studentId);
        renderErrors();
        updateGradeAndFeedback();
        saveData();
    });

    // Event listener for Generate Errors Report button
    $('#generateErrorsReportBtn').click(function () {
        generateErrorsReport();
    });

    // Event listener for Generate Student Reports button
    $('#generateStudentReportsBtn').click(function () {
        generateStudentReports();
    });

    // Event listener for Remove Student button
    $('#removeStudentBtn').click(function () {
        removeStudent();
    });


    // Initial load
    loadData();
});
