// static/js/script.js
$(document).ready(function() {
    let errors = [];
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
            errors.forEach(function(error) {
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

        // Render errors and update grade
        renderErrors();
        updateGradeAndFeedback();
    }

    // Function to save data to localStorage
    function saveData() {
        localStorage.setItem('errors', JSON.stringify(errors));
        localStorage.setItem('totalPoints', totalPoints);
    }

    // Function to update grade and feedback
    function updateGradeAndFeedback() {
        currentGrade = totalPoints;
        let feedbacks = [];
        errors.forEach(function(error) {
            if (error.selected) {
                currentGrade -= error.points;
                if (error.points > 0) {
                    feedbacks.push(error.feedback + ` (-${error.points} points)\n`);
                }
                else {
                    feedbacks.push(error.feedback + '\n');
                }
            }
        });
        if (currentGrade < 0) currentGrade = 0;
        $('#currentGrade').text(currentGrade.toFixed(2));
        $('#maxPoints').text(totalPoints.toFixed(2));
        $('#feedbackArea').val(feedbacks.join('\n'));

        // Save the updated data
        saveData();
    }

    // Function to render errors list
    function renderErrors() {
        $('#errorsList').empty();
        errors.forEach(function(error) {
            const errorHtml = `
                <div class="error-item" data-id="${error.id}">
                    <div class="d-flex align-items-center">
                        <span class="drag-handle mr-2">&#9776;</span>
                        <input type="checkbox" id="${error.id}" data-id="${error.id}" ${error.selected ? 'checked' : ''}>
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
            onEnd: function(evt) {
                // Update the errors array based on the new order
                let newOrder = [];
                $('#errorsList .error-item').each(function() {
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

    // Event listener for adding new error
    $('#addError').click(function() {
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

    // Event listener for errors checklist
    $('#errorsList').on('change', 'input[type="checkbox"]', function() {
        const id = $(this).data('id');
        const error = errors.find(e => e.id === id);
        if (error) {
            error.selected = $(this).is(':checked');
            updateGradeAndFeedback();
        }
    });

    // Event listener for delete error button
    $('#errorsList').on('click', '.delete-error-btn', function() {
        const id = $(this).data('id');
        const index = errors.findIndex(e => e.id === id);
        if (index !== -1 && confirm('Are you sure you want to delete this error?')) {
            errors.splice(index, 1);
            renderErrors();
            updateGradeAndFeedback();
        }
    });

    // Event listener for edit error button
    $('#errorsList').on('click', '.edit-error-btn', function() {
        const $errorItem = $(this).closest('.error-item');
        const $editForm = $errorItem.find('.edit-form');
        $editForm.slideDown();
    });

    // Event listener for save error button
    $('#errorsList').on('click', '.save-error-btn', function() {
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
    $('#errorsList').on('click', '.cancel-edit-btn', function() {
        const $errorItem = $(this).closest('.error-item');
        const $editForm = $errorItem.find('.edit-form');
        $editForm.slideUp();
    });

    // Event listener for total points change
    $('#totalPoints').on('input', function() {
        totalPoints = parseFloat($(this).val()) || 0;
        updateGradeAndFeedback();
    });

    // Event listener for reset button
    $('#resetBtn').click(function() {
        // Reset errors selections
        errors.forEach(function(error) {
            error.selected = false;
        });
        renderErrors();
        updateGradeAndFeedback();
    });

    // Event listener for clear data button
    $('#clearDataBtn').click(function() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            errors = [];
            totalPoints = 100;
            $('#totalPoints').val(totalPoints);
            errorIdCounter = 0; // Reset the error ID counter
            renderErrors();
            updateGradeAndFeedback();
        }
    });

    // Event listener for copy feedback button
    $('#copyFeedbackBtn').click(function() {
        const feedbackText = $('#feedbackArea').val();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(feedbackText).then(function() {
                $('#copyFeedbackBtn').text('Copied!');
                setTimeout(function() {
                    $('#copyFeedbackBtn').text('Copy');
                }, 2000);
            }, function(err) {
                console.error('Clipboard API failed: ', err);
            });
        } else {
            $('#feedbackArea').select();
            document.execCommand('copy');
            $('#copyFeedbackBtn').text('Copied!');
            setTimeout(function() {
                $('#copyFeedbackBtn').text('Copy');
            }, 2000);
        }
    });

    // Initial load
    loadData();
});
