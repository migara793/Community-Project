document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const featureSelect = document.getElementById('featureSelect');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const predictButton = document.getElementById('predictButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
    const forecastChart = document.getElementById('forecastChart');
    const exportCsvBtn = document.getElementById('exportCsv');
    const currentDateEl = document.getElementById('current-date');
    const maxValueEl = document.getElementById('maxValue');
    const minValueEl = document.getElementById('minValue');
    const avgChangeEl = document.getElementById('avgChange');
    
    // State variables
    let currentData = null;
    let currentFeature = null;
    
    // Initialize
    setCurrentDate();
    loadFeatures();
    
    // Event listeners
    predictButton.addEventListener('click', handlePrediction);
    exportCsvBtn.addEventListener('click', exportToCsv);
    
    // Set current date in header
    function setCurrentDate() {
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Load available features from backend
    async function loadFeatures() {
        try {
            const response = await axios.get('/get_feature_names');
            const features = response.data.data_columns;
            
            featureSelect.innerHTML = '';
            
            if (features.length === 0) {
                featureSelect.innerHTML = '<option value="" disabled selected>No features available</option>';
                return;
            }
            
            features.forEach(feature => {
                const option = document.createElement('option');
                option.value = feature;
                option.textContent = feature;
                featureSelect.appendChild(option);
            });
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            defaultOption.textContent = 'Select a feature';
            featureSelect.prepend(defaultOption);
            
        } catch (error) {
            showError('Failed to load features. Please try again later.');
            console.error('Feature load error:', error);
        }
    }
    
    // Handle prediction request
    async function handlePrediction() {
        const feature = featureSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Validation
        if (!feature) {
            showError('Please select a feature');
            return;
        }
        
        if (!startDate || !endDate) {
            showError('Please select both start and end dates');
            return;
        }
        
        if (new Date(startDate) >= new Date(endDate)) {
            showError('End date must be after start date');
            return;
        }
        
        try {
            // Show loading state
            predictButton.disabled = true;
            loadingIndicator.classList.remove('hidden');
            hideError();
            resultsContainer.classList.add('hidden');
            
            // Make prediction request
            const formData = new FormData();
            formData.append('feature', feature);
            formData.append('start_day', startDate);
            formData.append('end_day', endDate);
            
            const response = await axios.post('/predict_price', formData);
            const forecastData = response.data;
            
            // Store data for export
            currentData = forecastData;
            currentFeature = feature;
            
            // Display results
            displayResults(forecastData, feature);
            resultsContainer.classList.remove('hidden');
            
        } catch (error) {
            let errorMessage = 'Prediction failed';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage += `: ${error.response.data.error}`;
            } else if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            showError(errorMessage);
            console.error('Prediction error:', error);
        } finally {
            predictButton.disabled = false;
            loadingIndicator.classList.add('hidden');
        }
    }
    
    // Display results in table and chart
    function displayResults(data, feature) {
        // Clear previous results
        resultsTable.innerHTML = '';
        
        // Check if we have data
        if (!data || data.length === 0) {
            showError('No forecast data returned');
            return;
        }
        
        // Prepare data for display
        const dates = [];
        const values = [];
        let maxValue = -Infinity;
        let minValue = Infinity;
        let previousValue = null;
        let totalChange = 0;
        let changeCount = 0;
        
        // Process each data point
        data.forEach((item, index) => {
            const value = parseFloat(item.predicted_value);
            
            // Update min/max
            if (value > maxValue) maxValue = value;
            if (value < minValue) minValue = value;
            
            // Calculate change
            let change = null;
            if (previousValue !== null) {
                change = ((value - previousValue) / previousValue * 100).toFixed(2);
                totalChange += parseFloat(change);
                changeCount++;
            }
            previousValue = value;
            
            // Add to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.date}</td>
                <td>${value.toFixed(2)}</td>
                <td>${change ? `${change}%` : '-'}</td>
            `;
            resultsTable.appendChild(row);
            
            // Collect for chart
            dates.push(item.date);
            values.push(value);
        });
        
        // Update summary cards
        maxValueEl.textContent = maxValue.toFixed(2);
        minValueEl.textContent = minValue.toFixed(2);
        avgChangeEl.textContent = changeCount > 0 ? 
            (totalChange / changeCount).toFixed(2) + '%' : 
            '0%';
        
        // Render chart
        renderChart(dates, values, feature);
        
        // Add sorting functionality
        addTableSorting();
    }
    
    // Render chart using Chart.js
    function renderChart(dates, values, feature) {
        // Destroy existing chart if exists
        if (forecastChart.chart) {
            forecastChart.chart.destroy();
        }
        
        const ctx = forecastChart.getContext('2d');
        forecastChart.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `${feature} Forecast`,
                    data: values,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#3a56d4',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Value'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }
    
    // Add table sorting functionality
    function addTableSorting() {
        const table = document.getElementById('resultsTable');
        const headers = table.querySelectorAll('th');
        const tbody = table.querySelector('tbody');
        
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                // Get sort direction
                const isAscending = header.classList.contains('asc');
                const direction = isAscending ? -1 : 1;
                
                // Clear previous sort classes
                headers.forEach(h => h.classList.remove('asc', 'desc'));
                
                // Set new sort class
                header.classList.toggle('asc', !isAscending);
                header.classList.toggle('desc', isAscending);
                
                // Sort table rows
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                rows.sort((a, b) => {
                    const aValue = a.cells[index].textContent;
                    const bValue = b.cells[index].textContent;
                    
                    // Handle numeric values
                    if (index === 1 || index === 2) {
                        const aNum = parseFloat(aValue);
                        const bNum = parseFloat(bValue);
                        
                        if (!isNaN(aNum)) {
                            return direction * (aNum - bNum);
                        }
                    }
                    
                    // Handle date values
                    if (index === 0) {
                        return direction * (new Date(aValue) - new Date(bValue));
                    }
                    
                    // Default string comparison
                    return direction * aValue.localeCompare(bValue);
                });
                
                // Re-add rows in sorted order
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    }
    
    // Export data to CSV
    function exportToCsv() {
        if (!currentData || currentData.length === 0) {
            showError('No data to export');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Date,Predicted Value\n';
        
        currentData.forEach(item => {
            csvContent += `"${item.date}",${item.predicted_value}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${currentFeature}_forecast_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Show error message
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
    }
    
    // Hide error message
    function hideError() {
        errorContainer.classList.add('hidden');
    }
});