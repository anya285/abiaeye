// ABIA STATE POLICE COMMAND - CRIME REPORTING SYSTEM
// 100% FRONT-END INTERACTIVE DATABASE ENGINE (LOCAL STORAGE & GOOGLE SHEETS)

// Set your Google Sheets Web App URL here (follow instructions in GOOGLE_SHEETS_SETUP.md)
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyyZG4swFpYKZo3i5QxHkY1VcioTj8Dg8VO_R5Mz6WW33e8SbY1AsUZeT-zgvjn0iwq4w/exec';

// ==========================================
// 1. LOCAL STORAGE DATABASE ENGINE
// ==========================================
const LocalDb = {
    init() {
        // Initial Seed Reports
        if (!localStorage.getItem('crime_reports')) {
            const seedReports = [
                {
                    reference_no: 'AB20261204',
                    anonymous: 1,
                    crime_type: 'Theft & Robbery',
                    description: 'Armed robbery incident at a commercial bank along Azikiwe Road, Aba. Three suspects fled in a black SUV with cash bags.',
                    location: 'Aba South LGA, Abia State',
                    crime_date: '2026-06-25',
                    crime_time: '14:30',
                    image: null,
                    status: 'Under Investigation',
                    reporter_name: null,
                    reporter_phone: null,
                    reporter_email: null,
                    reporter_nin: null,
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    assigned_officer: 'Inspector Alex Okey'
                },
                {
                    reference_no: 'AB20263402',
                    anonymous: 0,
                    crime_type: 'Cybercrime / Fraud',
                    description: 'Suspected internet fraud operation and business email compromise targeting local traders. Scammer spoofed bank transfer receipts.',
                    location: 'Umuahia North LGA, Abia State',
                    crime_date: '2026-06-28',
                    crime_time: '09:15',
                    image: null,
                    status: 'Pending',
                    reporter_name: 'Kalu Chukwu',
                    reporter_phone: '08031234567',
                    reporter_email: 'kalu.chukwu@example.com',
                    reporter_nin: '12345678901',
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    assigned_officer: null
                },
                {
                    reference_no: 'AB20265691',
                    anonymous: 0,
                    crime_type: 'Kidnapping / Abduction',
                    description: 'Attempted abduction of a local politician near the bypass. The security detail repelled the attackers, leaving one suspect vehicle behind.',
                    location: 'Ohafia LGA, Abia State',
                    crime_date: '2026-06-29',
                    crime_time: '21:00',
                    image: null,
                    status: 'Resolved',
                    reporter_name: 'Sergeant Bisi Alimi',
                    reporter_phone: '08055551234',
                    reporter_email: 'bisi.alimi@abiapolice.gov.ng',
                    reporter_nin: '98765432109',
                    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    assigned_officer: 'Sergeant Bisi Alimi'
                }
            ];
            localStorage.setItem('crime_reports', JSON.stringify(seedReports));
        }

        // Force refresh officer seed if it contains the old 'admin' username
        if (localStorage.getItem('officers')) {
            const currentOfficers = JSON.parse(localStorage.getItem('officers') || '[]');
            if (currentOfficers.some(o => o.username === 'admin')) {
                localStorage.removeItem('officers');
            }
        }

        // Initial Seed Officers
        if (!localStorage.getItem('officers')) {
            const seedOfficers = [
                {
                    id: 'off-1',
                    full_name: 'Inspector Alex Okey',
                    email: 'alex.okey@abiapolice.gov.ng',
                    username: 'alex_okey',
                    password: 'password123',
                    role: 'Investigating Officer'
                },
                {
                    id: 'off-2',
                    full_name: 'Sergeant Bisi Alimi',
                    email: 'bisi.alimi@abiapolice.gov.ng',
                    username: 'bisi_alimi',
                    password: 'password123',
                    role: 'Investigating Officer'
                },
                {
                    id: 'off-3',
                    full_name: 'Super Admin',
                    email: 'command@abiapolice.gov.ng',
                    username: 'Anya285',
                    password: '1234567890',
                    role: 'Super Admin'
                }
            ];
            localStorage.setItem('officers', JSON.stringify(seedOfficers));
        }
    },

    getReports() {
        this.init();
        return JSON.parse(localStorage.getItem('crime_reports') || '[]');
    },

    saveReport(report) {
        const reports = this.getReports();
        reports.push(report);
        localStorage.setItem('crime_reports', JSON.stringify(reports));
        return report;
    },

    updateReport(ref, updates) {
        const reports = this.getReports();
        const index = reports.findIndex(r => r.reference_no === ref);
        if (index !== -1) {
            reports[index] = { ...reports[index], ...updates };
            localStorage.setItem('crime_reports', JSON.stringify(reports));
            return reports[index];
        }
        return null;
    },

    getOfficers() {
        this.init();
        return JSON.parse(localStorage.getItem('officers') || '[]');
    },

    saveOfficer(officer) {
        const officers = this.getOfficers();
        if (officer.id) {
            const index = officers.findIndex(o => o.id === officer.id);
            if (index !== -1) {
                // Keep password if blank when editing
                if (!officer.password && officers[index].password) {
                    officer.password = officers[index].password;
                }
                officers[index] = { ...officers[index], ...officer };
            }
        } else {
            officer.id = 'off-' + Date.now();
            officers.push(officer);
        }
        localStorage.setItem('officers', JSON.stringify(officers));
        return officer;
    },

    deleteOfficer(id) {
        const officers = this.getOfficers();
        const filtered = officers.filter(o => o.id !== id);
        localStorage.setItem('officers', JSON.stringify(filtered));
    },

    authenticateAdmin(username, password) {
        const officers = this.getOfficers();
        return officers.find(o => o.username === username && o.password === password) || null;
    }
};

// ==========================================
// 2. INPUT VALIDATION & TIME SIMULATION HELPERS
// ==========================================
function validateName(name) {
    if (!name || name.trim().length < 2) return false;
    return /^[a-zA-Z\s\-]+$/.test(name.trim());
}

function validatePhone(phone) {
    if (!phone || phone.trim().length < 7) return false;
    return /^[+0-9\s\-]+$/.test(phone.trim());
}

function validateNIN(nin) {
    if (!nin) return true;
    const cleanNin = nin.trim();
    if (cleanNin === '') return true;
    // NIN must contain only digits and be exactly 10 or 11 digits
    return /^\d{10,11}$/.test(cleanNin);
}

// Helper to generate Reference Numbers (e.g. AB20261492)
function generateReferenceNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AB${year}${randomNum}`;
}

// Dynamic time-based status progression simulation (checks timestamps and adjusts status if report is newly created)
function getDynamicStatus(report) {
    // If the admin has manually changed the status or assigned an officer, override simulation
    if (report.assigned_officer || report.status !== 'Pending') {
        return report.status;
    }

    // Only simulate live progression for recent reports (created within 5 minutes)
    const elapsedMs = Date.now() - new Date(report.created_at).getTime();
    const elapsedSecs = Math.floor(elapsedMs / 1000);

    if (elapsedSecs < 0) return report.status; // safety check
    
    // Simulate dispatcher action:
    if (elapsedSecs < 60) {
        return "Pending";               // 0 - 1 minute: Pending / Received
    } else if (elapsedSecs < 120) {
        return "Assigned";              // 1 - 2 minutes: Assigned / Check in Progress
    } else if (elapsedSecs < 180) {
        return "Under Investigation";   // 2 - 3 minutes: Under Investigation / Report being worked on
    } else {
        // After 3 minutes, return the actual database status (e.g., Resolved or whatever it settled to)
        return report.status;
    }
}

// Get dynamic friendly description for statuses
function getStatusDescription(status) {
    switch (status) {
        case 'Pending': return 'Checking status: Case received and queued.';
        case 'Assigned': return 'Check in progress: Officers are reviewing the lodged details.';
        case 'Under Investigation': return 'Report being worked on: Investigation team is actively collecting evidence.';
        case 'Resolved': return 'Case completed: Final report and resolution logged.';
        case 'Closed': return 'Closed: Case archived.';
        default: return '';
    }
}

// ==========================================
// 3. CITIZEN UI NAVIGATION & AUTO-NAV LOGIC
// ==========================================
function updateNavbar() {
    const guestLinks = document.querySelectorAll(".guest-link");
    const authLinks = document.querySelectorAll(".auth-link");
    
    const mockUser = localStorage.getItem("mock_citizen_id");
    if (mockUser) {
        guestLinks.forEach(el => el.style.display = "none");
        authLinks.forEach(el => el.style.display = "block");
        const citizenNameEl = document.getElementById("citizenName");
        if (citizenNameEl) citizenNameEl.textContent = localStorage.getItem("mock_citizen_name") || "Kalu Chukwu";
    } else {
        guestLinks.forEach(el => el.style.display = "block");
        authLinks.forEach(el => el.style.display = "none");
    }
}

// Handle Citizen Logouts
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        localStorage.removeItem("mock_citizen_id");
        localStorage.removeItem("mock_citizen_name");
        localStorage.removeItem("mock_citizen_email");
        localStorage.removeItem("mock_citizen_phone");
        localStorage.removeItem("mock_citizen_nin");
        window.location.href = "index.html";
    });
}

// ==========================================
// 4. CITIZEN REGISTRATION
// ==========================================
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
    registrationForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById("first_name").value.trim();
        const lastName = document.getElementById("last_name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const nin = document.getElementById("nin").value.trim();
        const password = document.getElementById("password").value;
        
        const submitBtn = document.getElementById("submitBtn");

        // Validate names
        if (!validateName(firstName) || !validateName(lastName)) {
            alert("Validation Error: Names must only contain letters, spaces, or hyphens.");
            return;
        }

        // Validate phone
        if (!validatePhone(phone)) {
            alert("Validation Error: Phone number must contain only numbers, spaces, or hyphens.");
            return;
        }

        // Validate NIN (must be 10 or 11 digits)
        if (nin && !validateNIN(nin)) {
            alert("Validation Error: NIN must contain only digits and be exactly 10 or 11 digits.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
        
        // Save to mock storage
        localStorage.setItem("mock_citizen_id", "usr-" + Date.now());
        localStorage.setItem("mock_citizen_name", `${firstName} ${lastName}`);
        localStorage.setItem("mock_citizen_email", email);
        localStorage.setItem("mock_citizen_phone", phone);
        localStorage.setItem("mock_citizen_nin", nin);
        
        document.querySelector(".split-container").style.display = "none";
        document.getElementById("successOverlay").style.display = "flex";
        
        setTimeout(() => {
            window.location.href = "report-crime.html";
        }, 2000);
    });
}

// ==========================================
// 5. CRIME REPORT SUBMISSIONS & REDIRECTS (WITH GOOGLE SHEET SYNC)
// ==========================================
const reportCrimeForm = document.getElementById("reportCrimeForm");
if (reportCrimeForm) {
    reportCrimeForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const isAnonymous = document.getElementById("anonymous_toggle").checked;
        const crimeType = document.getElementById("crime_type").value;
        const location = document.getElementById("location").value.trim();
        const crimeDate = document.getElementById("crime_date").value;
        const crimeTime = document.getElementById("crime_time").value;
        const description = document.getElementById("description").value.trim();
        
        const errorAlert = document.getElementById("errorAlert");
        const errorMsg = document.getElementById("errorMsg");
        const successOverlay = document.getElementById("successOverlay");
        const successRef = document.getElementById("successRef");
        const submitBtn = document.getElementById("submitBtn");

        let repName = null;
        let repEmail = null;
        let repPhone = null;
        let repNin = null;

        if (!isAnonymous) {
            repName = document.getElementById("reporter_name").value.trim();
            repEmail = document.getElementById("reporter_email").value.trim();
            repPhone = document.getElementById("reporter_phone").value.trim();
            repNin = document.getElementById("reporter_nin").value.trim();

            // Validate Name
            if (!validateName(repName)) {
                errorMsg.textContent = "Full Name is invalid. It must only contain letters, spaces, or hyphens.";
                errorAlert.style.display = "flex";
                window.scrollTo(0, 0);
                return;
            }

            // Validate Phone
            if (!validatePhone(repPhone)) {
                errorMsg.textContent = "Phone number is invalid. It must be numeric (digits only, e.g., 08031234567).";
                errorAlert.style.display = "flex";
                window.scrollTo(0, 0);
                return;
            }

            // Validate NIN (10 or 11 digits)
            if (repNin && !validateNIN(repNin)) {
                errorMsg.textContent = "NIN is invalid. It must be a number containing exactly 10 or 11 digits.";
                errorAlert.style.display = "flex";
                window.scrollTo(0, 0);
                return;
            }
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

        const refNo = generateReferenceNumber();

        // Create report object
        const newReport = {
            reference_no: refNo,
            anonymous: isAnonymous ? 1 : 0,
            crime_type: crimeType,
            description: description,
            location: location,
            crime_date: crimeDate,
            crime_time: crimeTime,
            image: null,
            status: 'Pending',
            reporter_name: repName,
            reporter_phone: repPhone,
            reporter_email: repEmail,
            reporter_nin: repNin,
            created_at: new Date().toISOString(),
            assigned_officer: null
        };

        // 1. Save report locally (always)
        LocalDb.saveReport(newReport);

        // 2. Sync to Google Sheets if Webhook URL is set
        if (GOOGLE_SHEET_WEBHOOK_URL) {
            fetch(GOOGLE_SHEET_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(newReport)
            }).then(() => {
                console.log("Report successfully synced with Google Sheets.");
            }).catch(err => {
                console.error("Failed to sync with Google Sheets:", err);
            });
        }

        // Populate receipt details
        successRef.textContent = refNo;
        document.getElementById("recCategory").textContent = crimeType;
        document.getElementById("recLocation").textContent = location;
        document.getElementById("recDateTime").textContent = `${new Date(crimeDate).toLocaleDateString()} ${crimeTime}`;
        document.getElementById("recReporter").innerHTML = isAnonymous 
            ? '<i class="fa-solid fa-user-secret" style="color: #00e676;"></i> Anonymous'
            : `<i class="fa-solid fa-user" style="color: #ffd600;"></i> ${escapeHTML(repName)}`;

        // Make the serial code clickable
        const successRefLink = document.getElementById("successRef");
        if (successRefLink) {
            successRefLink.style.cursor = "pointer";
            successRefLink.style.textDecoration = "underline";
            successRefLink.title = "Click to track this case status";
            successRefLink.onclick = function() {
                window.location.href = `track-report.html?ref=${refNo}`;
            };
        }

        // Live Track Progress Button setup
        const btnTrack = document.getElementById("btnTrackProgress");
        const timelineArea = document.getElementById("receiptLiveTimeline");
        if (btnTrack && timelineArea) {
            btnTrack.style.display = "block"; // reset display
            timelineArea.style.display = "none"; // reset timeline
            
            btnTrack.onclick = function() {
                btnTrack.style.display = "none"; // hide button
                timelineArea.style.display = "block"; // show timeline
                
                // Start dynamic interval updates
                const startTime = Date.now();
                
                const updateLiveProgress = () => {
                    const elapsedMs = Date.now() - startTime;
                    const elapsedSecs = Math.floor(elapsedMs / 1000);
                    
                    let activeStep = 0;
                    let fillWidth = 0;
                    let descText = "";
                    
                    if (elapsedSecs < 60) {
                        activeStep = 0;
                        fillWidth = 0;
                        descText = "Checking status: Case received and queued.";
                    } else if (elapsedSecs < 120) {
                        activeStep = 1;
                        fillWidth = 33;
                        descText = "Check in progress: Officers are reviewing the lodged details.";
                    } else if (elapsedSecs < 180) {
                        activeStep = 2;
                        fillWidth = 66;
                        descText = "Report being worked on: Investigation team is actively collecting evidence.";
                    } else {
                        activeStep = 3;
                        fillWidth = 100;
                        descText = "Case solved: Final report and resolution logged.";
                    }
                    
                    // Update progress bar fill width
                    const fill = document.getElementById("receiptProgressFill");
                    if (fill) fill.style.width = fillWidth + "%";
                    
                    // Update descriptions
                    const descEl = document.getElementById("receiptStatusDesc");
                    if (descEl) descEl.textContent = descText;
                    
                    // Update step circles
                    const steps = document.querySelectorAll(".receipt-step");
                    steps.forEach(step => {
                        const stepNum = parseInt(step.getAttribute("data-step"));
                        const dot = step.querySelector(".step-dot");
                        const label = step.querySelector("span");
                        
                        if (stepNum < activeStep) {
                            // Completed steps
                            dot.style.backgroundColor = "#00e676";
                            dot.style.color = "#070c14";
                            dot.innerHTML = '<i class="fa-solid fa-check"></i>';
                            label.style.color = "#00e676";
                        } else if (stepNum === activeStep) {
                            // Active step (pulsing)
                            if (activeStep === 2) {
                                // In Progress has a spin loader
                                dot.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                                dot.style.backgroundColor = "#0284c7"; // sky blue
                                dot.style.color = "#ffffff";
                                label.style.color = "#0284c7";
                            } else if (activeStep === 3) {
                                // Case solved
                                dot.innerHTML = '<i class="fa-solid fa-square-check"></i>';
                                dot.style.backgroundColor = "#ffd600"; // gold
                                dot.style.color = "#070c14";
                                label.style.color = "#ffd600";
                            } else {
                                dot.innerHTML = '<i class="fa-solid fa-circle-dot"></i>';
                                dot.style.backgroundColor = "#00e676"; // green
                                dot.style.color = "#070c14";
                                label.style.color = "#00e676";
                            }
                            dot.style.boxShadow = "0 0 10px rgba(0, 230, 118, 0.4)";
                        } else {
                            // Future steps
                            dot.style.backgroundColor = "#1f2937";
                            dot.style.color = "#94a3b8";
                            dot.innerHTML = '<i class="fa-solid fa-circle"></i>';
                            dot.style.boxShadow = "none";
                            label.style.color = "#94a3b8";
                        }
                    });
                };
                
                // Initial call and run every second
                updateLiveProgress();
                const progressInterval = setInterval(() => {
                    // Check if success overlay is closed or hidden
                    if (successOverlay.style.display === "none") {
                        clearInterval(progressInterval);
                        return;
                    }
                    updateLiveProgress();
                }, 1000);
            };
        }

        document.querySelector(".report-section").style.display = "none";
        successOverlay.style.display = "flex";
    });
}

// ==========================================
// 6. TRACK REPORT (GOOGLE SHEETS INTEGRATION & TIME SIMULATION)
// ==========================================
function renderTrackResults(report) {
    const resultsCard = document.getElementById("resultsCard");
    const errorAlert = document.getElementById("errorAlert");
    
    errorAlert.style.display = "none";
    resultsCard.style.display = "block";
    
    // Simulate status change based on time elapsed
    const dynamicStatus = getDynamicStatus(report);
    const dynamicDesc = getStatusDescription(dynamicStatus);

    // Set details
    document.getElementById("resRef").textContent = report.reference_no;
    document.getElementById("resCategory").textContent = report.crime_type;
    document.getElementById("resDate").textContent = new Date(report.crime_date).toLocaleDateString() + ' ' + report.crime_time;
    document.getElementById("resLocation").textContent = report.location;
    document.getElementById("resReporter").innerHTML = report.anonymous === 1 
        ? '<i class="fa-solid fa-user-secret" style="color: var(--color-teal);"></i> Anonymous Submission'
        : `<i class="fa-solid fa-user-check" style="color: var(--color-assigned);"></i> Registered: ${escapeHTML(report.reporter_name)}`;
    
    // Update Badge
    const badge = document.getElementById("resStatusBadge");
    badge.textContent = dynamicStatus;
    badge.className = "status-badge " + getStatusBadgeClass(dynamicStatus);
    badge.title = dynamicDesc;

    // Update Progression Timeline
    updateProgressionTimeline(dynamicStatus);
}

const trackForm = document.getElementById("trackForm");
if (trackForm) {
    trackForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const refNo = document.getElementById("reference_no").value.trim().toUpperCase();
        const errorAlert = document.getElementById("errorAlert");
        const resultsCard = document.getElementById("resultsCard");
        const submitBtn = document.getElementById("searchBtn");

        // Validate serial input prefix (must start with AB or CR)
        if (!refNo.startsWith("AB") && !refNo.startsWith("CR")) {
            alert("Please enter a valid tracking serial number starting with AB or CR.");
            return;
        }

        if (GOOGLE_SHEET_WEBHOOK_URL) {
            // Query Google Sheet
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming...';

            fetch(`${GOOGLE_SHEET_WEBHOOK_URL}?ref=${refNo}`)
                .then(res => res.json())
                .then(data => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;

                    if (data.status === 'success' && data.report) {
                        renderTrackResults(data.report);
                    } else {
                        // Fallback to local drive
                        const localReport = LocalDb.getReports().find(r => r.reference_no === refNo);
                        if (localReport) {
                            renderTrackResults(localReport);
                        } else {
                            resultsCard.style.display = "none";
                            errorAlert.style.display = "flex";
                        }
                    }
                })
                .catch(err => {
                    console.error("Google Sheets query error:", err);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;

                    // Fallback to local drive
                    const localReport = LocalDb.getReports().find(r => r.reference_no === refNo);
                    if (localReport) {
                        renderTrackResults(localReport);
                    } else {
                        resultsCard.style.display = "none";
                        errorAlert.style.display = "flex";
                    }
                });
        } else {
            // Read from local drive (localStorage)
            const report = LocalDb.getReports().find(r => r.reference_no === refNo);
            if (report) {
                renderTrackResults(report);
            } else {
                resultsCard.style.display = "none";
                errorAlert.style.display = "flex";
            }
        }
    });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Pending': return 'status-pending';
        case 'Assigned': return 'status-assigned';
        case 'Under Investigation': return 'status-investigating';
        case 'Resolved': return 'status-resolved';
        case 'Closed': return 'status-closed';
        default: return '';
    }
}

function updateProgressionTimeline(status) {
    const fill = document.getElementById("timelineProgressFill");
    const steps = document.querySelectorAll(".timeline-step");
    
    let progressPercentage = 0;
    const activeSteps = [];

    if (status === "Pending") {
        progressPercentage = 0;
        activeSteps.push("Pending");
    } else if (status === "Assigned") {
        progressPercentage = 33;
        activeSteps.push("Pending", "Assigned");
    } else if (status === "Under Investigation") {
        progressPercentage = 66;
        activeSteps.push("Pending", "Assigned", "Under Investigation");
    } else if (status === "Resolved" || status === "Closed") {
        progressPercentage = 100;
        activeSteps.push("Pending", "Assigned", "Under Investigation", "Resolved");
    }

    if (fill) fill.style.width = progressPercentage + "%";

    steps.forEach(step => {
        const stepName = step.getAttribute("data-step");
        const dot = step.querySelector(".dot");
        
        if (activeSteps.includes(stepName)) {
            dot.style.backgroundColor = "var(--color-teal)";
            dot.style.color = "#ffffff";
            dot.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else {
            dot.style.backgroundColor = "var(--border-color)";
            dot.style.color = "var(--text-muted)";
            dot.innerHTML = '<i class="fa-solid fa-circle"></i>';
        }

        // Pulse the currently active status
        if (stepName === status) {
            dot.style.backgroundColor = status === "Under Investigation" ? "var(--color-investigating)" : "var(--color-accent)";
            dot.style.boxShadow = "0 0 10px rgba(217, 119, 6, 0.4)";
            if (status === "Under Investigation") {
                dot.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            }
        } else {
            dot.style.boxShadow = "none";
        }
    });
}

// Auto track parameter parsing (?ref=AB...)
function parseTrackingParam() {
    if (!window.location.pathname.includes("track-report.html")) return;
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
        const refInput = document.getElementById("reference_no");
        if (refInput) {
            refInput.value = ref;
            const searchBtn = document.getElementById("searchBtn");
            if (searchBtn) searchBtn.click();
        }
    }
}

// ==========================================
// 7. ADMIN SIGN-IN & SESSIONS
// ==========================================
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const errorAlert = document.getElementById("errorAlert");
        const errorMsg = document.getElementById("errorMsg");
        const successAlert = document.getElementById("successAlert");
        const submitBtn = document.getElementById("submitBtn");

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

        const admin = LocalDb.authenticateAdmin(username, password);

        if (admin) {
            sessionStorage.setItem("admin_id", admin.id);
            sessionStorage.setItem("admin_name", admin.full_name);
            sessionStorage.setItem("admin_username", admin.username);
            sessionStorage.setItem("admin_role", admin.role);

            successAlert.style.display = "flex";
            errorAlert.style.display = "none";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            errorMsg.textContent = "Invalid username or password credentials.";
            errorAlert.style.display = "flex";
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Access Admin Console';
        }
    });
}

// Authenticate Admin Session on dashboards
function checkAdminSession() {
    const adminId = sessionStorage.getItem("admin_id");
    const isLoginPage = window.location.pathname.includes("admin-login.html");
    
    if (!adminId && !isLoginPage && window.location.pathname.includes("/admin/")) {
        window.location.href = "admin-login.html";
        return;
    }

    if (adminId) {
        const nameEl = document.getElementById("adminName");
        const roleEl = document.getElementById("adminRole");
        const initialsEl = document.getElementById("adminInitials");
        const officersLink = document.getElementById("officersLink");
        
        if (nameEl) nameEl.textContent = sessionStorage.getItem("admin_name");
        if (roleEl) {
            const role = sessionStorage.getItem("admin_role");
            roleEl.textContent = role;
            roleEl.className = "badge-role " + (role === 'Super Admin' ? 'super' : 'officer');
            
            if (officersLink && role === 'Super Admin') {
                officersLink.style.display = "block";
            }
        }
        
        if (initialsEl) {
            const name = sessionStorage.getItem("admin_name") || "Officer";
            const parts = name.split(' ');
            let ini = parts[0].substring(0, 1).toUpperCase();
            if (parts.length > 1) ini += parts[parts.length - 1].substring(0, 1).toUpperCase();
            initialsEl.textContent = ini;
        }
    }
}

// Handle Admin Logout
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = "admin-login.html";
    });
}

// ==========================================
// 8. ADMIN DASHBOARD & OVERVIEW
// ==========================================
function loadAdminDashboard() {
    if (!window.location.pathname.includes("admin/dashboard.html")) return;

    const reports = LocalDb.getReports();

    // Map through reports to apply elapsed-time status progression
    const reportsWithProgress = reports.map(r => ({
        ...r,
        status: getDynamicStatus(r)
    }));

    const total = reportsWithProgress.length;
    const pending = reportsWithProgress.filter(r => r.status === 'Pending').length;
    const assigned = reportsWithProgress.filter(r => r.status === 'Assigned' || r.status === 'Under Investigation').length;
    const resolved = reportsWithProgress.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;

    document.getElementById("totalReports").textContent = total;
    document.getElementById("pendingReports").textContent = pending;
    document.getElementById("assignedReports").textContent = assigned;
    document.getElementById("resolvedReports").textContent = resolved;

    // Make dashboard cards clickable
    const cards = document.querySelectorAll(".admin-card");
    if (cards.length >= 4) {
        cards[0].style.cursor = "pointer";
        cards[0].onclick = () => window.location.href = "reports.html";
        cards[1].style.cursor = "pointer";
        cards[1].onclick = () => window.location.href = "reports.html?status=Pending";
        cards[2].style.cursor = "pointer";
        cards[2].onclick = () => window.location.href = "reports.html?status=Assigned";
        cards[3].style.cursor = "pointer";
        cards[3].onclick = () => window.location.href = "reports.html?status=Resolved";
    }

    // Populate Recent alerts list
    const tableBody = document.getElementById("alertsTableBody");
    if (tableBody) {
        if (reportsWithProgress.length > 0) {
            tableBody.innerHTML = "";
            
            const sortedReports = [...reportsWithProgress]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);

            sortedReports.forEach(report => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--border-color)";
                tr.innerHTML = `
                    <td class="font-bold" style="color: var(--color-accent);">${report.reference_no}</td>
                    <td>${report.anonymous === 1 ? '<i class="fa-solid fa-user-secret" style="color: var(--color-teal);"></i> Anonymous' : escapeHTML(report.reporter_name || 'Registered Citizen')}</td>
                    <td>${report.crime_type}</td>
                    <td>${report.location}</td>
                    <td>${new Date(report.crime_date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${getStatusBadgeClass(report.status)}">${report.status}</span></td>
                    <td>
                        <a href="report-details.html?ref=${report.reference_no}" class="btn btn-primary" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; border-radius: var(--radius-sm);">
                            <i class="fa-solid fa-folder-open"></i> Manage
                        </a>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }
}

// ==========================================
// 9. ADMIN REPORTS DIRECTORY & QUERY FILTER
// ==========================================
function loadAdminReportsList() {
    if (!window.location.pathname.includes("admin/reports.html")) return;

    const tableBody = document.getElementById("reportsTableBody");
    const filterForm = document.getElementById("filterForm");
    const tableInfo = document.getElementById("tableInfo");

    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    if (statusParam) {
        const statusSelect = document.getElementById("status");
        if (statusSelect) {
            statusSelect.value = statusParam;
        }
    }

    function fetchAndRenderReports() {
        const searchVal = document.getElementById("search").value.trim().toLowerCase();
        const typeFilter = document.getElementById("crime_type").value;
        const statusFilter = document.getElementById("status").value;
        const dateFilter = document.getElementById("crime_date").value;

        const reports = LocalDb.getReports();

        // Map status progression
        const reportsWithProgress = reports.map(r => ({
            ...r,
            status: getDynamicStatus(r)
        }));

        let filtered = reportsWithProgress;

        if (typeFilter) {
            filtered = filtered.filter(r => r.crime_type.includes(typeFilter) || typeFilter.includes(r.crime_type));
        }
        if (statusFilter) {
            if (statusFilter === "Assigned") {
                filtered = filtered.filter(r => r.status === 'Assigned' || r.status === 'Under Investigation');
            } else {
                filtered = filtered.filter(r => r.status === statusFilter);
            }
        }
        if (dateFilter) {
            filtered = filtered.filter(r => r.crime_date === dateFilter);
        }
        if (searchVal) {
            filtered = filtered.filter(r => 
                r.reference_no.toLowerCase().includes(searchVal) ||
                (r.reporter_name && r.reporter_name.toLowerCase().includes(searchVal)) ||
                r.location.toLowerCase().includes(searchVal) ||
                r.description.toLowerCase().includes(searchVal)
            );
        }

        if (filtered.length > 0) {
            tableBody.innerHTML = "";
            filtered.forEach(report => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--border-color)";
                tr.innerHTML = `
                    <td class="font-bold" style="color: var(--color-accent);">${report.reference_no}</td>
                    <td>${report.anonymous === 1 ? '<i class="fa-solid fa-user-secret" style="color: var(--color-teal);"></i> Anonymous' : escapeHTML(report.reporter_name || 'Registered Citizen')}</td>
                    <td>${report.crime_type}</td>
                    <td>${report.location}</td>
                    <td>${new Date(report.crime_date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${getStatusBadgeClass(report.status)}">${report.status}</span></td>
                    <td>${new Date(report.created_at).toLocaleString()}</td>
                    <td>
                        <a href="report-details.html?ref=${report.reference_no}" class="btn btn-primary" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; border-radius: var(--radius-sm);">
                            <i class="fa-solid fa-folder-open"></i> Manage
                        </a>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            tableInfo.textContent = `Showing ${filtered.length} matching reports`;
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="color: var(--text-muted); padding: 2rem;">
                        <i class="fa-solid fa-folder-open" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                        No crime reports match filters.
                    </td>
                </tr>
            `;
            tableInfo.textContent = "Showing 0 reports";
        }
    }

    if (filterForm) {
        filterForm.addEventListener("submit", function(e) {
            e.preventDefault();
            fetchAndRenderReports();
        });
    }

    fetchAndRenderReports();
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ==========================================
// 10. ADMIN REPORT CASE DETAILS & HISTORY
// ==========================================
function loadAdminReportDetails() {
    if (!window.location.pathname.includes("admin/report-details.html")) return;

    const urlParams = new URLSearchParams(window.location.search);
    const refNo = urlParams.get('ref');

    if (!refNo) {
        alert("No report reference specified.");
        window.location.href = "reports.html";
        return;
    }

    const reports = LocalDb.getReports();
    const report = reports.find(r => r.reference_no === refNo);

    if (!report) {
        alert("Report not found in database.");
        window.location.href = "reports.html";
        return;
    }

    // Apply simulation status
    const currentSimulatedStatus = getDynamicStatus(report);

    // Populate Details
    document.getElementById("reportRef").textContent = report.reference_no;
    document.getElementById("reportLodgedDate").textContent = new Date(report.created_at).toLocaleString();
    document.getElementById("resCategory").textContent = report.crime_type;
    document.getElementById("resLocation").textContent = report.location;
    document.getElementById("resDate").textContent = new Date(report.crime_date).toLocaleDateString();
    document.getElementById("resTime").textContent = report.crime_time;
    document.getElementById("resDescription").textContent = report.description;

    const statusSelect = document.getElementById("status");
    if (statusSelect) statusSelect.value = currentSimulatedStatus;

    const warningEl = document.getElementById("anonymousWarning");
    const detailsEl = document.getElementById("reporterDetails");

    if (report.anonymous === 1) {
        warningEl.style.display = "flex";
        detailsEl.style.display = "none";
    } else {
        warningEl.style.display = "none";
        detailsEl.style.display = "grid";
        document.getElementById("repName").textContent = report.reporter_name || 'N/A';
        document.getElementById("repEmail").textContent = report.reporter_email || 'N/A';
        document.getElementById("repPhone").textContent = report.reporter_phone || 'N/A';
    }

    const evidenceContainer = document.getElementById("evidenceContainer");
    if (evidenceContainer) {
        evidenceContainer.innerHTML = `<div style="color: var(--text-muted); font-style: italic; font-size: 0.9rem;">No photo evidence uploaded.</div>`;
    }

    const officerSelect = document.getElementById("assign_officer");
    if (officerSelect) {
        officerSelect.innerHTML = `<option value="">-- Unassigned / Choose Officer --</option>`;
        const officers = LocalDb.getOfficers();
        officers.forEach(off => {
            const opt = document.createElement("option");
            opt.value = off.full_name;
            opt.textContent = off.full_name;
            if (report.assigned_officer === off.full_name) {
                opt.selected = true;
            }
            officerSelect.appendChild(opt);
        });
    }

    populateAuditLogs({ ...report, status: currentSimulatedStatus });

    // Apply changes
    const actionForm = document.getElementById("actionForm");
    if (actionForm) {
        actionForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const selectedOfficer = document.getElementById("assign_officer").value;
            const selectedStatus = document.getElementById("status").value;
            
            const successAlert = document.getElementById("successAlert");
            const submitBtn = actionForm.querySelector("button[type='submit']");

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            LocalDb.updateReport(refNo, {
                status: selectedStatus,
                assigned_officer: selectedOfficer || null
            });

            successAlert.style.display = "flex";
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }
}

function populateAuditLogs(report) {
    const timeline = document.getElementById("historyTimeline");
    if (!timeline) return;

    timeline.innerHTML = "";

    const logs = [];
    
    logs.push({
        title: "Report Lodged",
        desc: `Incident filed via digital portal. Reference: ${report.reference_no}`,
        time: new Date(report.created_at).toLocaleString()
    });

    if (report.assigned_officer) {
        logs.push({
            title: "Officer Assigned",
            desc: `Assigned to Investigating Officer: ${report.assigned_officer}`,
            time: new Date(report.created_at).toLocaleString()
        });
    }

    if (report.status === "Under Investigation") {
        logs.push({
            title: "Investigation Active",
            desc: `Case marked as active. Reviewing evidence files.`,
            time: new Date().toLocaleString()
        });
    } else if (report.status === "Resolved" || report.status === "Closed") {
        logs.push({
            title: "Case Resolved",
            desc: `Final resolution notes drafted and logged. Status: ${report.status}`,
            time: new Date().toLocaleString()
        });
    }

    logs.reverse().forEach(log => {
        const li = document.createElement("li");
        li.className = "timeline-item";
        li.style.marginBottom = "1.25rem";
        li.innerHTML = `
            <div style="font-weight: 700; color: #ffffff; font-size: 0.9rem;">${log.title}</div>
            <div style="color: var(--text-secondary); font-size: 0.82rem; margin-top: 0.15rem;">${log.desc}</div>
            <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.15rem;">${log.time}</div>
        `;
        timeline.appendChild(li);
    });
}

// ==========================================
// 11. OFFICER MANAGEMENT CRUD
// ==========================================
function loadOfficerManagement() {
    if (!window.location.pathname.includes("admin/officers.html")) return;

    const tableBody = document.getElementById("officersTableBody");
    const officerForm = document.getElementById("officerForm");
    const editIdInput = document.getElementById("edit_officer_id");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const formTitle = document.getElementById("formTitle");
    const passwordInput = document.getElementById("password");
    const passwordHelp = document.getElementById("passwordHelp");

    function renderOfficers() {
        const officers = LocalDb.getOfficers();
        tableBody.innerHTML = "";

        officers.forEach(off => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid var(--border-color)";
            tr.innerHTML = `
                <td>
                    <div class="font-bold" style="color: #ffffff;">${escapeHTML(off.full_name)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(off.email)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-accent);">Username: @${escapeHTML(off.username)}</div>
                </td>
                <td>
                    <span class="badge-role ${off.role === 'Super Admin' ? 'super' : 'officer'}">${off.role}</span>
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 0.35rem; justify-content: center;">
                        <button type="button" class="btn btn-secondary btn-edit" data-id="${off.id}" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-color: var(--border-color);">
                            <i class="fa-solid fa-edit"></i> Edit
                        </button>
                        <button type="button" class="btn btn-danger btn-delete" data-id="${off.id}" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" ${off.username === 'admin' ? 'disabled' : ''}>
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.onclick = function() {
                const offId = this.getAttribute("data-id");
                const off = LocalDb.getOfficers().find(o => o.id === offId);
                if (off) {
                    editIdInput.value = off.id;
                    document.getElementById("full_name").value = off.full_name;
                    document.getElementById("email").value = off.email;
                    document.getElementById("username").value = off.username;
                    document.getElementById("role").value = off.role;
                    
                    passwordInput.required = false;
                    passwordHelp.style.display = "block";
                    formTitle.innerHTML = `<i class="fa-solid fa-user-pen" style="color: var(--color-accent);"></i> Edit Officer Profile`;
                    cancelEditBtn.style.display = "inline-block";
                    officerForm.querySelector("button[type='submit']").innerHTML = `<i class="fa-solid fa-save"></i> Save Profile`;
                }
            };
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.onclick = function() {
                const offId = this.getAttribute("data-id");
                const off = LocalDb.getOfficers().find(o => o.id === offId);
                if (off) {
                    if (confirm(`Are you sure you want to remove ${off.full_name}?`)) {
                        LocalDb.deleteOfficer(offId);
                        renderOfficers();
                        showOfficerAlert("Officer deleted successfully.");
                    }
                }
            };
        });
    }

    function resetOfficerForm() {
        editIdInput.value = "";
        officerForm.reset();
        passwordInput.required = true;
        passwordHelp.style.display = "none";
        formTitle.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--color-accent);"></i> Add Officer Profile`;
        cancelEditBtn.style.display = "none";
        officerForm.querySelector("button[type='submit']").innerHTML = `<i class="fa-solid fa-user-check"></i> Register Officer`;
    }

    function showOfficerAlert(msg) {
        const successAlert = document.getElementById("successAlert");
        successAlert.style.display = "flex";
        successAlert.querySelector("span").textContent = msg;
        setTimeout(() => {
            successAlert.style.display = "none";
        }, 3000);
    }

    if (officerForm) {
        officerForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const fullName = document.getElementById("full_name").value.trim();
            const email = document.getElementById("email").value.trim();
            const username = document.getElementById("username").value.trim();
            const role = document.getElementById("role").value;
            const password = passwordInput.value;
            const editId = editIdInput.value;

            if (!validateName(fullName)) {
                alert("Validation Error: Full Name must only contain letters, spaces, or hyphens.");
                return;
            }

            const newOfficer = {
                id: editId || null,
                full_name: fullName,
                email: email,
                username: username,
                role: role,
                password: password || null
            };

            LocalDb.saveOfficer(newOfficer);
            renderOfficers();
            showOfficerAlert(editId ? "Officer profile updated successfully." : "New officer registered successfully.");
            resetOfficerForm();
        });

        cancelEditBtn.onclick = resetOfficerForm;
    }

    renderOfficers();
}

// ==========================================
// 12. CRIME STATISTICS (CHARTS)
// ==========================================
function loadCrimeStatistics() {
    if (!window.location.pathname.includes("admin/statistics.html")) return;

    const reports = LocalDb.getReports();

    // Map dynamic status progression
    const reportsWithProgress = reports.map(r => ({
        ...r,
        status: getDynamicStatus(r)
    }));

    if (reportsWithProgress.length === 0) {
        document.getElementById("topCategory").textContent = "N/A";
        document.getElementById("topLocation").textContent = "N/A";
        document.getElementById("resolutionRate").textContent = "0%";
        return;
    }

    const categoriesCount = {};
    const locationsCount = {};
    let resolvedCount = 0;

    reportsWithProgress.forEach(r => {
        categoriesCount[r.crime_type] = (categoriesCount[r.crime_type] || 0) + 1;
        locationsCount[r.location] = (locationsCount[r.location] || 0) + 1;
        if (r.status === 'Resolved' || r.status === 'Closed') {
            resolvedCount++;
        }
    });

    let topCat = "None";
    let maxCat = 0;
    for (const [cat, count] of Object.entries(categoriesCount)) {
        if (count > maxCat) {
            maxCat = count;
            topCat = cat;
        }
    }
    document.getElementById("topCategory").textContent = topCat;

    let topLoc = "None";
    let maxLoc = 0;
    for (const [loc, count] of Object.entries(locationsCount)) {
        const cleanLoc = loc.split(",")[0];
        if (count > maxLoc) {
            maxLoc = count;
            topLoc = cleanLoc;
        }
    }
    document.getElementById("topLocation").textContent = topLoc;

    const resolutionPercentage = Math.round((resolvedCount / reportsWithProgress.length) * 100);
    document.getElementById("resolutionRate").textContent = resolutionPercentage + "%";
    document.getElementById("resolvedCount").textContent = resolvedCount;
    document.getElementById("totalCount").textContent = reportsWithProgress.length;

    // A. Chart 1: Bar Chart (Crime by Category)
    const categoryLabels = Object.keys(categoriesCount);
    const categoryData = Object.values(categoriesCount);

    const ctxCategory = document.getElementById("crimeTypeChart");
    if (ctxCategory) {
        new Chart(ctxCategory, {
            type: 'bar',
            data: {
                labels: categoryLabels,
                datasets: [{
                    label: 'Logged Incidents',
                    data: categoryData,
                    backgroundColor: 'rgba(0, 230, 118, 0.4)',
                    borderColor: '#00e676',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // B. Chart 2: Doughnut Chart (Resolution Status)
    const statusCounts = {
        'Pending': 0,
        'Assigned': 0,
        'Under Investigation': 0,
        'Resolved': 0,
        'Closed': 0
    };
    reportsWithProgress.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const ctxResolution = document.getElementById("resolutionChart");
    if (ctxResolution) {
        new Chart(ctxResolution, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#e2e8f0', // Pending (slate)
                        '#f59e0b', // Assigned (amber)
                        '#0284c7', // Investigating (sky)
                        '#10b981', // Resolved (emerald)
                        '#6b7280'  // Closed (gray)
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8', padding: 12 }
                    }
                }
            }
        });
    }

    // C. Chart 3: Line Chart (Monthly Crime Trends)
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    const monthlyCounts = [2, 1, 3, 2, 4, reportsWithProgress.length];

    const ctxTrend = document.getElementById("monthlyTrendChart");
    if (ctxTrend) {
        new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Reports Trend',
                    data: monthlyCounts,
                    borderColor: '#ffd600',
                    backgroundColor: 'rgba(255, 214, 0, 0.05)',
                    tension: 0.35,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffd600'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }
}

// ==========================================
// 13. ON PAGE LOAD DISPATCHER
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    LocalDb.init();

    updateNavbar();
    checkAdminSession();
    parseTrackingParam();

    if (window.location.pathname.includes("admin/dashboard.html")) {
        loadAdminDashboard();
    }
    if (window.location.pathname.includes("admin/reports.html")) {
        loadAdminReportsList();
    }
    if (window.location.pathname.includes("admin/report-details.html")) {
        loadAdminReportDetails();
    }
    if (window.location.pathname.includes("admin/officers.html")) {
        loadOfficerManagement();
    }
    if (window.location.pathname.includes("admin/statistics.html")) {
        loadCrimeStatistics();
    }
});
