document.addEventListener('DOMContentLoaded', () => {
  // Global variables
  let scheduleData = [];
  let lessonData = {};
  let symbolsData = {};
  let dutyData = [];
  let currentWeek = 1; // Default starting week
  
  // Date related variables
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // DOM elements
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');
  const calendarEl = document.getElementById('calendar');
  const calendarGridEl = document.getElementById('calendar-grid');
  const currentMonthYearEl = document.getElementById('current-month-year');
  const dayDetailsEl = document.getElementById('day-details');
  const selectedDateEl = document.getElementById('selected-date');
  const morningLessonsEl = document.getElementById('morning-lessons');
  const morningLocationEl = document.getElementById('morning-location');
  const morningTeacherEl = document.getElementById('morning-teacher');
  const afternoonLessonsEl = document.getElementById('afternoon-lessons');
  const afternoonLocationEl = document.getElementById('afternoon-location');
  const afternoonTeacherEl = document.getElementById('afternoon-teacher');
  const currentWeekEl = document.getElementById('current-week');
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const lessonInfoEl = document.getElementById('lesson-info');
  const lessonsListEl = document.getElementById('lessons-list');
  const symbolsListEl = document.getElementById('symbols-list');
  const refTabs = document.querySelectorAll('.ref-tab');
  const referenceTableBody = document.getElementById('reference-table-body');
  const hocphanBtns = document.querySelectorAll('.hocphan-btn');
  const weekTabs = document.querySelectorAll('.week-tab');
  const weeklyScheduleEl = document.getElementById('weekly-schedule');
  const takeQuizBtn = document.getElementById('take-quiz-btn');
  
  // Tables elements
  const hocphan4TableBody = document.getElementById('hocphan4-table-body');
  const hocphan2TableBody = document.getElementById('hocphan2-table-body');

  // DOM elements for duty schedule
  const dutyScheduleBody = document.getElementById('duty-schedule-body');
  const loadingDutyIndicator = document.getElementById('loading-duty');
  const errorDutyContainer = document.getElementById('error-duty-container');

  // Initialize theme
  initTheme();

  // Fetch all data
  fetchAllData();

  // Event listeners
  themeToggle.addEventListener('click', toggleTheme);
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.getAttribute('data-section');
      switchSection(sectionId);
    });
  });

  weekTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const week = parseInt(tab.getAttribute('data-week'));
      switchWeek(week);
    });
  });
  
  // Event listener for the "Take a Quiz" button
  takeQuizBtn.addEventListener('click', () => {
    // Navigate to the Quiz App page
    window.location.href = 'ct_correct_2/index.html';
  });
  
  prevWeekBtn.addEventListener('click', () => {
    if (currentWeek > 1) {
      currentWeek--;
      updateCurrentWeekDisplay();
      renderWeeklySchedule();
    }
  });

  nextWeekBtn.addEventListener('click', () => {
    if (currentWeek < 15) { // Assuming max 15 weeks in a semester
      currentWeek++;
      updateCurrentWeekDisplay();
      renderWeeklySchedule();
    }
  });
  
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateMonthYearDisplay();
    renderMonthCalendar();
  });
  
  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateMonthYearDisplay();
    renderMonthCalendar();
  });
  
  // Add event listeners for học phần buttons
  hocphanBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const hocphan = btn.getAttribute('data-hocphan');
      hocphanBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLessonsList(hocphan);
    });
  });

  // Functions
  function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('theme', 'dark');
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
      localStorage.setItem('theme', 'light');
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
  }

  function switchSection(sectionId) {
    // Skip section switching for special buttons like "take-quiz"
    if (!sectionId) return;
    
    // Update active button
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-section') === sectionId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show corresponding section
    sections.forEach(section => {
      if (section.id === sectionId) {
        section.classList.add('active');
        
        // Initialize specific sections when activated
        if (sectionId === 'symbols') {
          loadSymbols();
        } else if (sectionId === 'lesson-details') {
          // Load both học phần data
          loadAllHocPhanTables();
        } else if (sectionId === 'duty-schedule') {
          renderDutySchedule();
        }
      } else if (section.id !== 'lesson-tables') { // Don't hide the lesson tables section
        section.classList.remove('active');
      }
    });
  }
  
  function switchWeek(week) {
    currentWeek = week;
    
    // Update active tab
    weekTabs.forEach(tab => {
      if (parseInt(tab.getAttribute('data-week')) === week) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Render the weekly schedule
    renderWeeklySchedule();
  }

  async function fetchAllData() {
    try {
      // Fetch schedule data
      const scheduleResponse = await fetch('schedule.json');
      scheduleData = await scheduleResponse.json();
      
      // Fetch lesson data
      const lessonResponse = await fetch('name_of_lesson.json');
      lessonData = await lessonResponse.json();
      
      // Fetch symbols data
      const symbolsResponse = await fetch('symbol.json');
      symbolsData = await symbolsResponse.json();
      
      // Fetch duty schedule data
      try {
        const dutyResponse = await fetch('lichtruc.json');
        const dutyJson = await dutyResponse.json();
        dutyData = dutyJson.LịchTrựcĐạiĐội2 || [];
      } catch (err) {
        console.error('Error loading duty schedule data:', err);
        dutyData = [];
      }
      
      // Initialize UI components based on active section
      const activeSection = document.querySelector('.section.active');
      
      // Initialize calendar
      updateMonthYearDisplay();
      renderMonthCalendar();
      
      // Initialize schedule
      renderWeeklySchedule();
      
      // Initialize the lesson tables data for both học phần
      populateLessonTables();
      
      // Initialize overview section with today's date if it's active
      if (activeSection && activeSection.id === 'overall') {
        // Get today's details
        showFullDayDetails(today.getDate(), today.getMonth(), today.getFullYear());
      }
      
      // Initialize duty schedule table if that section is active
      if (activeSection && activeSection.id === 'duty-schedule') {
        renderDutySchedule();
      }
      
      // Initialize lesson list if lesson-details section is active
      if (activeSection && activeSection.id === 'lesson-details') {
        const activeHocphanBtn = document.querySelector('.hocphan-btn.active');
        const hocphanType = activeHocphanBtn ? activeHocphanBtn.getAttribute('data-hocphan') : 'HọcPhần4';
        renderLessonsList(hocphanType);
      }
      
      // Initialize symbols if symbols section is active
      if (activeSection && activeSection.id === 'symbols') {
        loadSymbols();
      }
      
      console.log('All data loaded successfully!');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  function updateCurrentWeekDisplay() {
    currentWeekEl.textContent = currentWeek;
  }
  
  function updateMonthYearDisplay() {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    currentMonthYearEl.textContent = `${months[currentMonth]}, ${currentYear}`;
  }

  function renderWeeklySchedule() {
    // Clear schedule
    weeklyScheduleEl.innerHTML = '';
    
    // Filter schedule for current week
    const weekSchedule = scheduleData.filter(item => item.week === currentWeek.toString());
    
    if (weekSchedule.length === 0) {
      weeklyScheduleEl.innerHTML = '<p class="instruction">Không tìm thấy dữ liệu cho tuần này</p>';
      return;
    }
    
    // Define days of week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create daily schedule cards
    daysOfWeek.forEach(day => {
      const dayData = weekSchedule.find(item => item.day === day);
      
      if (dayData) {
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        
        const vietnameseDays = {
          'Monday': 'Thứ Hai',
          'Tuesday': 'Thứ Ba',
          'Wednesday': 'Thứ Tư',
          'Thursday': 'Thứ Năm',
          'Friday': 'Thứ Sáu',
          'Saturday': 'Thứ Bảy',
          'Sunday': 'Chủ Nhật'
        };
        
        dayCard.innerHTML = `
          <div class="day-header">
            <span>${vietnameseDays[day]}</span>
            <span>${dayData.Date}</span>
          </div>
          <div class="day-content">
            ${dayData.morning ? `
              <div class="session-morning">
                <div class="session-code">${dayData.morning}</div>
                <div class="session-location"><strong>Địa điểm:</strong> ${dayData.where_morning || 'N/A'}</div>
                <div class="session-teacher"><strong>Giáo viên:</strong> ${dayData.Teacher_name_morning || 'N/A'}</div>
              </div>
            ` : '<div class="session-morning">Không có lớp buổi sáng</div>'}
            
            ${dayData.afternoon ? `
              <div class="session-afternoon">
                <div class="session-code">${dayData.afternoon}</div>
                <div class="session-location"><strong>Địa điểm:</strong> ${dayData.where_afternoon || 'N/A'}</div>
                <div class="session-teacher"><strong>Giáo viên:</strong> ${dayData.Teacher_name_afternoon || 'N/A'}</div>
              </div>
            ` : '<div class="session-afternoon">Không có lớp buổi chiều</div>'}
          </div>
        `;
        
        // Add event listeners to lesson codes
        weeklyScheduleEl.appendChild(dayCard);
        
        // Add click event to lesson codes
        const morningCodeEl = dayCard.querySelector('.session-morning .session-code');
        const afternoonCodeEl = dayCard.querySelector('.session-afternoon .session-code');
        
        if (morningCodeEl && dayData.morning) {
          morningCodeEl.addEventListener('click', () => {
            // For codes like "CT1, CT2", we just take the first one for simplicity
            const code = dayData.morning.split(',')[0].trim();
            showLessonDetails(code);
            switchSection('lesson-details');
          });
        }
        
        if (afternoonCodeEl && dayData.afternoon) {
          afternoonCodeEl.addEventListener('click', () => {
            // For codes like "CT1, CT2", we just take the first one for simplicity
            const code = dayData.afternoon.split(',')[0].trim();
            showLessonDetails(code);
            switchSection('lesson-details');
          });
        }
      }
    });
  }
  
  function renderMonthCalendar() {
    // Clear grid
    calendarGridEl.innerHTML = '';
    
    // Update month/year display
    updateMonthYearDisplay();
    
    // Get first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // Get last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get day of week for first day (0-6, 0 is Sunday)
    // Convert to 0-6 where 0 is Monday
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Sunday becomes 6
    
    // Get total days in the month
    const totalDays = lastDay.getDate();
    
    // Get total days from previous month to show
    const prevMonthDays = firstDayOfWeek;
    
    // Get last day of previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    // Calculate total cells needed
    const totalCells = Math.ceil((prevMonthDays + totalDays) / 7) * 7;
    
    // Keep track of the date being rendered
    let day = 1;
    let nextMonthDay = 1;
    
    // Create calendar cells
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.classList.add('calendar-day-cell');
      
      // Previous month days
      if (i < prevMonthDays) {
        const prevMonthDate = prevMonthLastDay - prevMonthDays + i + 1;
        cell.innerHTML = `<div class="day-number">${prevMonthDate}</div>`;
        cell.classList.add('other-month');
        
        // Get date string for previous month
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const dateStr = formatDateForEvents(prevMonthDate, prevMonth + 1);
        
        // Add events for previous month days
        addEventsToCell(cell, dateStr, prevYear, prevMonth);
      }
      // Current month days
      else if (i < prevMonthDays + totalDays) {
        const date = i - prevMonthDays + 1;
        cell.innerHTML = `<div class="day-number">${date}</div>`;
        
        // Today's date
        if (date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
          cell.classList.add('today');
        }
        
        // Get date string in format DD/MM
        const dateStr = formatDateForEvents(date, currentMonth + 1);
        
        // Add events to cell
        addEventsToCell(cell, dateStr, currentYear, currentMonth);
        
        // Make this cell clickable to show details
        cell.addEventListener('click', () => {
          // Remove selected class from all cells
          document.querySelectorAll('.calendar-day-cell').forEach(c => {
            c.classList.remove('selected');
          });
          
          // Add selected class to this cell
          cell.classList.add('selected');
          
          // Show day details
          showFullDayDetails(date, currentMonth, currentYear);
        });
        
        day++;
      }
      // Next month days
      else {
        const nextMonthDate = nextMonthDay;
        cell.innerHTML = `<div class="day-number">${nextMonthDate}</div>`;
        cell.classList.add('other-month');
        
        // Get date string for next month
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = formatDateForEvents(nextMonthDate, nextMonth + 1);
        
        // Add events for next month days
        addEventsToCell(cell, dateStr, nextYear, nextMonth);
        
        nextMonthDay++;
      }
      
      calendarGridEl.appendChild(cell);
    }
  }

  // Helper function to format date for event lookup
  function formatDateForEvents(day, month) {
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`;
  }
  
  // Function to add events to calendar cell
  function addEventsToCell(cell, dateStr, year, month) {
    // Check schedule data for events on this day
    const eventsForDate = scheduleData.filter(item => item.Date.includes(dateStr));
    
    // Check duty data for duty on this date
    const dutyForDate = dutyData.filter(item => item.Ngày === dateStr);
    
    // If no events, return
    if (eventsForDate.length === 0 && dutyForDate.length === 0) return;
    
    // Mark cell as having events
    cell.classList.add('has-events');
    
    // Add morning class event if exists
    if (eventsForDate.length > 0 && eventsForDate[0].morning) {
      const morningEvent = document.createElement('div');
      morningEvent.classList.add('calendar-event', 'morning');
      morningEvent.textContent = eventsForDate[0].morning;
      cell.appendChild(morningEvent);
    }
    
    // Add afternoon class event if exists
    if (eventsForDate.length > 0 && eventsForDate[0].afternoon) {
      const afternoonEvent = document.createElement('div');
      afternoonEvent.classList.add('calendar-event', 'afternoon');
      afternoonEvent.textContent = eventsForDate[0].afternoon;
      cell.appendChild(afternoonEvent);
    }
    
    // Add duty event if exists
    if (dutyForDate.length > 0) {
      const dutyEvent = document.createElement('div');
      dutyEvent.classList.add('calendar-event', 'duty');
      dutyEvent.textContent = 'Trực';
      cell.appendChild(dutyEvent);
    }
  }
  
  // Function to update overview lessons content
  function updateOverviewLessonsContent(lessonCodes) {
    const overviewLessonsContentEl = document.getElementById('overview-lessons-content');
    if (overviewLessonsContentEl) {
      overviewLessonsContentEl.innerHTML = '';
      
      if (!lessonCodes || lessonCodes.length === 0) {
        overviewLessonsContentEl.innerHTML = '<p class="no-data-message">Không có thông tin</p>';
        return;
      }

      // Remove duplicates from lesson codes
      const uniqueLessonCodes = [...new Set(lessonCodes.map(code => code.trim()))];

      uniqueLessonCodes.forEach(code => {
        const lessonInfo = getLessonInfo(code);
        if (lessonInfo) {
          const lessonPreview = document.createElement('div');
          lessonPreview.classList.add('lesson-preview');
          lessonPreview.innerHTML = `
            <h5>${lessonInfo.MãBài}: ${lessonInfo.TênBài}</h5>
            <p><strong>Trang:</strong> ${lessonInfo.Trang}</p>
            <p><strong>Tài liệu:</strong> ${lessonInfo.TàiLiệu}</p>
          `;
          overviewLessonsContentEl.appendChild(lessonPreview);
        }
      });
      
      if (overviewLessonsContentEl.children.length === 0) {
        overviewLessonsContentEl.innerHTML = '<p class="no-data-message">Không có thông tin</p>';
      }
    }
  }
  
  // Function to get lesson information from lesson code
  function getLessonInfo(code) {
    // Check in HọcPhần4
    const hp4 = lessonData.HọcPhần4?.NộiDung || [];
    let lesson = hp4.find(l => l.MãBài === code);
    
    // If not found, check in HọcPhần2
    if (!lesson) {
      const hp2 = lessonData.HọcPhần2?.NộiDung || [];
      lesson = hp2.find(l => l.MãBài === code);
    }
    
    return lesson;
  }
  
  function renderReferenceTable(hocphanId) {
    console.log(`Rendering reference table for: ${hocphanId}`);
    
    const tableBody = document.getElementById('reference-table-body');
    const tableContainer = document.querySelector('.reference-table-container');
    
    // Start fade-out transition and show loading
    tableBody.classList.add('fade-out');
    tableContainer.classList.add('loading');
    
    // Wait for fade-out to complete before updating content
    setTimeout(() => {
      if (!lessonData) {
        console.error('Lesson data not loaded yet');
        tableBody.innerHTML = '<tr><td colspan="4">Đang tải dữ liệu...</td></tr>';
        tableContainer.classList.remove('loading');
        return;
      }
      
    const hocphan = lessonData[hocphanId];
    
      if (!hocphan || !hocphan.NộiDung) {
        console.warn(`No data found for ${hocphanId}`);
        tableBody.innerHTML = '<tr><td colspan="4">Không tìm thấy dữ liệu</td></tr>';
        tableBody.classList.remove('fade-out');
        tableBody.classList.add('fade-in');
        tableContainer.classList.remove('loading');
      return;
    }
    
      tableBody.innerHTML = '';
      console.log(`Found ${hocphan.NộiDung.length} lessons for ${hocphanId}`);
    
    hocphan.NộiDung.forEach(lesson => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td class="lesson-code-cell">${lesson.MãBài}</td>
        <td>${lesson.TênBài}</td>
        <td>${lesson.Trang}</td>
        <td>${lesson.TàiLiệu}</td>
      `;
      
        tableBody.appendChild(row);
      });
      
      // Start fade-in transition and hide loading
      tableBody.classList.remove('fade-out');
      tableBody.classList.add('fade-in');
      tableContainer.classList.remove('loading');
      
      // Remove the fade-in class after animation completes
      setTimeout(() => {
        tableBody.classList.remove('fade-in');
      }, 500);
      
    }, 300); // This timeout should match the CSS transition duration
  }
  
  function renderLessonsList(hocphanId) {
    const hocphan = lessonData[hocphanId];
    
    if (!hocphan) {
      lessonsListEl.innerHTML = '<p class="instruction">Không tìm thấy dữ liệu học phần</p>';
      return;
    }
    
    lessonsListEl.innerHTML = `
      <div class="lessons-category">
        <h3 class="category-title">${hocphan.TiêuĐề}</h3>
        <div class="lessons-grid">
          ${hocphan.NộiDung.map(lesson => `
            <div class="lesson-item" data-code="${lesson.MãBài}">
              <span class="lesson-code">${lesson.MãBài}</span>
              <div class="lesson-title">${lesson.TênBài}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add click event to lesson items
    document.querySelectorAll('.lesson-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.getAttribute('data-code');
        showLessonDetails(code);
      });
    });
  }

  function showLessonDetails(code) {
    let lesson = null;
    
    // Check in HọcPhần4
    const hp4 = lessonData.HọcPhần4?.NộiDung || [];
    lesson = hp4.find(l => l.MãBài === code);
    
    // If not found, check in HọcPhần2
    if (!lesson) {
      const hp2 = lessonData.HọcPhần2?.NộiDung || [];
      lesson = hp2.find(l => l.MãBài === code);
    }
    
    if (lesson) {
      lessonInfoEl.innerHTML = `
        <div class="lesson-card">
          <h3>${lesson.MãBài}: ${lesson.TênBài}</h3>
          <div class="lesson-property">
            <strong>Trang:</strong> ${lesson.Trang}
          </div>
          <div class="lesson-property">
            <strong>Tài liệu:</strong> ${lesson.TàiLiệu}
          </div>
        </div>
      `;
    } else {
      lessonInfoEl.innerHTML = `
        <p class="instruction">Không tìm thấy thông tin cho mã học phần: ${code}</p>
      `;
    }
  }

  function loadSymbols() {
    if (!symbolsData || !symbolsData['Giải thích ký hiệu']) {
      symbolsListEl.innerHTML = '<div class="error-message">Không thể tải dữ liệu ký hiệu. Vui lòng thử lại sau.</div>';
      return;
    }
    
    const symbols = symbolsData['Giải thích ký hiệu'];
    
    symbolsListEl.innerHTML = '';
    
    for (const [code, meaning] of Object.entries(symbols)) {
      const symbolItem = document.createElement('div');
      symbolItem.classList.add('symbol-item');
      symbolItem.innerHTML = `
        <div class="symbol-code">${code}</div>
        <div class="symbol-meaning">${meaning}</div>
      `;
      
      symbolsListEl.appendChild(symbolItem);
    }
  }

  // Populate all lesson tables
  function populateLessonTables() {
    // Populate Học phần 4 table
    const hp4Data = lessonData.HọcPhần4?.NộiDung || [];
    populateLessonTable(hocphan4TableBody, hp4Data);
    
    // Populate Học phần 2 table
    const hp2Data = lessonData.HọcPhần2?.NộiDung || [];
    populateLessonTable(hocphan2TableBody, hp2Data);
  }
  
  // Helper function to populate a lesson table
  function populateLessonTable(tableBodyElement, lessonsData) {
    // Clear table
    tableBodyElement.innerHTML = '';
    
    if (!lessonsData || lessonsData.length === 0) {
      tableBodyElement.innerHTML = '<tr><td colspan="4">Không có dữ liệu</td></tr>';
      return;
    }
    
    // Add rows for each lesson
    lessonsData.forEach(lesson => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td class="lesson-code-col">${lesson.MãBài}</td>
        <td>${lesson.TênBài}</td>
        <td>${lesson.Trang}</td>
        <td>${lesson.TàiLiệu}</td>
      `;
      
      tableBodyElement.appendChild(row);
    });
  }

  function loadAllHocPhanTables() {
    // Load both Học phần 4 and Học phần 2 tables
    populateLessonTables();
  }

  // Duty Schedule functions
  function renderDutySchedule() {
    if (!dutyScheduleBody) return;
    
    if (loadingDutyIndicator) {
      loadingDutyIndicator.style.display = 'block';
    }
    
    if (errorDutyContainer) {
      errorDutyContainer.innerHTML = '';
    }
    
    if (!dutyData || dutyData.length === 0) {
      if (loadingDutyIndicator) {
        loadingDutyIndicator.style.display = 'none';
      }
      
      if (errorDutyContainer) {
        errorDutyContainer.innerHTML = '<div class="error-message">Không có dữ liệu lịch trực</div>';
      }
      
      dutyScheduleBody.innerHTML = '<tr><td colspan="8">Không có dữ liệu lịch trực</td></tr>';
      return;
    }
    
    // Sort by date
    const sortedData = [...dutyData].sort((a, b) => {
      const dateA = parseDutyDate(a.Ngày);
      const dateB = parseDutyDate(b.Ngày);
      return dateA - dateB;
    });
    
    // Hide loading indicator
    if (loadingDutyIndicator) {
      loadingDutyIndicator.style.display = 'none';
    }
    
    // Clear table body
    dutyScheduleBody.innerHTML = '';
    
    // Add rows for each day in the schedule
    sortedData.forEach(day => {
      const row = document.createElement('tr');
      
      // Add weekend class for Saturday and Sunday
      if (day.Thứ === 'Chủ nhật' || day.Thứ === 'Thứ bảy') {
        row.classList.add('weekend');
      }
      
      // Add table cells
      row.innerHTML = `
        <td>${day.Ngày}</td>
        <td>${day.Thứ}</td>
        <td class="duty-code">${formatDutyValue(day.TrựcNhàĂn)}</td>
        <td class="duty-code">${formatDutyValue(day.TrựcVsKV1)}</td>
        <td class="duty-code">${formatDutyValue(day.TrựcVsKV2)}</td>
        <td class="duty-code">${formatDutyValue(day.TrựcVsKV3)}</td>
        <td class="duty-code">${formatDutyValue(day.TrựcGácĐêm)}</td>
        <td>${day.GhiChú || ''}</td>
      `;
      
      dutyScheduleBody.appendChild(row);
    });
  }
  
  // Helper function to format duty values
  function formatDutyValue(value) {
    if (!value) return '';
    if (value === 'x') return '—'; // Replace 'x' with em dash
    return value;
  }
  
  // Helper function to parse date from DD/MM format
  function parseDutyDate(dateStr) {
    if (!dateStr) return new Date(0);
    
    const parts = dateStr.split('/');
    if (parts.length !== 2) return new Date(0); // Invalid date
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
    const year = new Date().getFullYear(); // Current year
    
    return new Date(year, month, day);
  }

  // Function to show full details for a selected day
  function showFullDayDetails(day, month, year) {
    const dateStr = formatDateForEvents(day, month + 1);
    const fullDateStr = `${dateStr}/${year}`;
    
    // Update selected date display
    const dayOfWeek = new Date(year, month, day).toLocaleDateString('vi-VN', { weekday: 'long' });
    selectedDateEl.textContent = `${dayOfWeek}, ${dateStr}`;
    
    // Also update overview selected date display
    const overviewSelectedDateEl = document.getElementById('overview-selected-date');
    if (overviewSelectedDateEl) {
      overviewSelectedDateEl.textContent = `${dayOfWeek}, ${dateStr}`;
    }
    
    // Find schedule data for this day
    const scheduleForDate = scheduleData.filter(item => item.Date.includes(dateStr));
    
    // Find duty data for this day
    const dutyForDate = dutyData.filter(item => item.Ngày === dateStr);
    
    // Flag to track if we have any class information
    let hasClassInfo = false;
    let allLessonCodes = [];
    
    // Morning class details
    if (scheduleForDate.length > 0 && scheduleForDate[0].morning) {
      hasClassInfo = true;
      const morningData = scheduleForDate[0];
      const lessonCodes = morningData.morning.split(',').map(code => code.trim());
      allLessonCodes = allLessonCodes.concat(lessonCodes);
      
      // Update morning lessons display
      morningLessonsEl.innerHTML = lessonCodes.map(code => 
        `<span class="lesson-code" data-code="${code}">${code}</span>`
      ).join(', ');
      
      // Also update overview morning lessons
      const overviewMorningLessonsEl = document.getElementById('overview-morning-lessons');
      if (overviewMorningLessonsEl) {
        overviewMorningLessonsEl.innerHTML = lessonCodes.map(code => 
          `<span class="lesson-code" data-code="${code}">${code}</span>`
        ).join(', ');
        
        // Add click event to lesson codes
        overviewMorningLessonsEl.querySelectorAll('.lesson-code').forEach(codeEl => {
          codeEl.addEventListener('click', () => {
            const code = codeEl.getAttribute('data-code');
            showLessonDetails(code);
            switchSection('lesson-details');
          });
        });
      }
      
      // Update morning location and teacher
      morningLocationEl.textContent = morningData.where_morning || 'N/A';
      morningTeacherEl.textContent = morningData.Teacher_name_morning || 'N/A';
      
      // Also update overview morning location and teacher
      const overviewMorningLocationEl = document.getElementById('overview-morning-location');
      const overviewMorningTeacherEl = document.getElementById('overview-morning-teacher');
      if (overviewMorningLocationEl) {
        overviewMorningLocationEl.textContent = morningData.where_morning || 'N/A';
      }
      if (overviewMorningTeacherEl) {
        overviewMorningTeacherEl.textContent = morningData.Teacher_name_morning || 'N/A';
      }
    } else {
      morningLessonsEl.textContent = 'Không có lịch học';
      morningLocationEl.textContent = 'N/A';
      morningTeacherEl.textContent = 'N/A';
      
      // Also update overview morning sections
      const overviewMorningLessonsEl = document.getElementById('overview-morning-lessons');
      const overviewMorningLocationEl = document.getElementById('overview-morning-location');
      const overviewMorningTeacherEl = document.getElementById('overview-morning-teacher');
      
      if (overviewMorningLessonsEl) {
        overviewMorningLessonsEl.textContent = 'Không có lịch học';
      }
      if (overviewMorningLocationEl) {
        overviewMorningLocationEl.textContent = 'N/A';
      }
      if (overviewMorningTeacherEl) {
        overviewMorningTeacherEl.textContent = 'N/A';
      }
    }
    
    // Afternoon class details
    if (scheduleForDate.length > 0 && scheduleForDate[0].afternoon) {
      hasClassInfo = true;
      const afternoonData = scheduleForDate[0];
      const lessonCodes = afternoonData.afternoon.split(',').map(code => code.trim());
      allLessonCodes = allLessonCodes.concat(lessonCodes);
      
      // Update afternoon lessons display
      afternoonLessonsEl.innerHTML = lessonCodes.map(code => 
        `<span class="lesson-code" data-code="${code}">${code}</span>`
      ).join(', ');
      
      // Also update overview afternoon lessons
      const overviewAfternoonLessonsEl = document.getElementById('overview-afternoon-lessons');
      if (overviewAfternoonLessonsEl) {
        overviewAfternoonLessonsEl.innerHTML = lessonCodes.map(code => 
          `<span class="lesson-code" data-code="${code}">${code}</span>`
        ).join(', ');
        
        // Add click event to lesson codes
        overviewAfternoonLessonsEl.querySelectorAll('.lesson-code').forEach(codeEl => {
          codeEl.addEventListener('click', () => {
            const code = codeEl.getAttribute('data-code');
            showLessonDetails(code);
            switchSection('lesson-details');
          });
        });
      }
      
      // Update afternoon location and teacher
      afternoonLocationEl.textContent = afternoonData.where_afternoon || 'N/A';
      afternoonTeacherEl.textContent = afternoonData.Teacher_name_afternoon || 'N/A';
      
      // Also update overview afternoon location and teacher
      const overviewAfternoonLocationEl = document.getElementById('overview-afternoon-location');
      const overviewAfternoonTeacherEl = document.getElementById('overview-afternoon-teacher');
      if (overviewAfternoonLocationEl) {
        overviewAfternoonLocationEl.textContent = afternoonData.where_afternoon || 'N/A';
      }
      if (overviewAfternoonTeacherEl) {
        overviewAfternoonTeacherEl.textContent = afternoonData.Teacher_name_afternoon || 'N/A';
      }
    } else {
      afternoonLessonsEl.textContent = 'Không có lịch học';
      afternoonLocationEl.textContent = 'N/A';
      afternoonTeacherEl.textContent = 'N/A';
      
      // Also update overview afternoon sections
      const overviewAfternoonLessonsEl = document.getElementById('overview-afternoon-lessons');
      const overviewAfternoonLocationEl = document.getElementById('overview-afternoon-location');
      const overviewAfternoonTeacherEl = document.getElementById('overview-afternoon-teacher');
      
      if (overviewAfternoonLessonsEl) {
        overviewAfternoonLessonsEl.textContent = 'Không có lịch học';
      }
      if (overviewAfternoonLocationEl) {
        overviewAfternoonLocationEl.textContent = 'N/A';
      }
      if (overviewAfternoonTeacherEl) {
        overviewAfternoonTeacherEl.textContent = 'N/A';
      }
    }
    
    // Update overview lessons content with all lesson codes
    if (hasClassInfo) {
      // Filter out special codes like "CT+", "KC+", "Thi TH P4", etc.
      allLessonCodes = allLessonCodes.filter(code => 
        !code.includes('+') && 
        !code.includes('Thi') && 
        !code.toLowerCase().includes('thi') &&
        code.match(/^[A-Za-z]{2}\d+$/)
      );
      updateOverviewLessonsContent(allLessonCodes);
    } else {
      updateOverviewLessonsContent([]);
    }
    
    // Update duty details in both main panel and overview
    updateDutyDetails(dutyForDate, 'duty-info-content');
    updateDutyDetails(dutyForDate, 'overview-duty-content');
    
    // Show the day details panel
    const dayDetailsEl = document.getElementById('day-details');
    if (dayDetailsEl) {
      dayDetailsEl.classList.add('show');
    }
  }

  // Helper function to update duty details
  function updateDutyDetails(dutyForDate, elementId) {
    const dutyInfoContentEl = document.getElementById(elementId);
    if (!dutyInfoContentEl) return;

    if (dutyForDate.length > 0) {
      const dutyData = dutyForDate[0];
      dutyInfoContentEl.innerHTML = `
        <div class="duty-info-grid">
          <div class="duty-item">
            <span class="duty-label">Trực Nhà Ăn:</span>
            <span class="duty-value">${formatDutyValue(dutyData.TrựcNhàĂn)}</span>
          </div>
          <div class="duty-item">
            <span class="duty-label">Trực VS KV1:</span>
            <span class="duty-value">${formatDutyValue(dutyData.TrựcVsKV1)}</span>
          </div>
          <div class="duty-item">
            <span class="duty-label">Trực VS KV2:</span>
            <span class="duty-value">${formatDutyValue(dutyData.TrựcVsKV2)}</span>
          </div>
          <div class="duty-item">
            <span class="duty-label">Trực VS KV3:</span>
            <span class="duty-value">${formatDutyValue(dutyData.TrựcVsKV3)}</span>
          </div>
          <div class="duty-item">
            <span class="duty-label">Trực Gác Đêm:</span>
            <span class="duty-value">${formatDutyValue(dutyData.TrựcGácĐêm)}</span>
          </div>
          ${dutyData.GhiChú ? `
            <div class="duty-item full-width">
              <span class="duty-label">Ghi chú:</span>
              <span class="duty-value">${dutyData.GhiChú}</span>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      dutyInfoContentEl.innerHTML = '<p class="no-data-message">Không có lịch trực trong ngày này</p>';
    }
  }
}); 