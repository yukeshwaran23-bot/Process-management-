// ==========================================
// PROCESS MANAGEMENT
// FIREBASE VERSION
// PART 1 / 2
// ==========================================


// ==========================================
// 1. FIREBASE IMPORTS
// ==========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// 2. FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyByxd8OOxHM_Gn_Sier1OFpXAcee4LTmXU",
  authDomain: "process-management-fe3c2.firebaseapp.com",
  projectId: "process-management-fe3c2",
  storageBucket: "process-management-fe3c2.firebasestorage.app",
  messagingSenderId: "1037954010869",
  appId: "1:1037954010869:web:77578ed3fd439e26747fbc",
  measurementId: "G-W2TGQ8J97P"
};


// ==========================================
// 3. START FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const processesRef = collection(
  db,
  "processes"
);


// ==========================================
// 4. APP STATE
// ==========================================

let processes = [];

let currentPage = "given";

let selectedId = null;

let confirmAction = null;

let isSaving = false;


// ==========================================
// 5. GET HTML ELEMENTS
// ==========================================

const addBtn =
  document.getElementById("addBtn");

const tabs =
  document.querySelectorAll(".tab");

const tabLine =
  document.querySelector(".tab-line");

const searchInput =
  document.getElementById("searchInput");

const statusText =
  document.getElementById("statusText");

const statusSmall =
  document.getElementById("statusSmall");

const cardContainer =
  document.getElementById("cardContainer");

const appContainer =
  document.querySelector(".app");


// ==========================================
// 6. FORM ELEMENTS
// ==========================================

const formModal =
  document.getElementById("formModal");

const processForm =
  document.getElementById("processForm");

const closeFormBtn =
  document.getElementById("closeForm");

const cancelFormBtn =
  document.getElementById("cancelForm");

const formTitle =
  document.getElementById("formTitle");

const editIdInput =
  document.getElementById("editId");

const partyNameInput =
  document.getElementById("partyName");

const totalSareesInput =
  document.getElementById("totalSarees");

const sareeTypeInput =
  document.getElementById("sareeType");

const givenDateInput =
  document.getElementById("givenDate");

const deliveryDateInput =
  document.getElementById("deliveryDate");

const parceledDateInput =
  document.getElementById("parceledDate");

const givenDateGroup =
  document.getElementById("givenDateGroup");

const deliveryDateGroup =
  document.getElementById("deliveryDateGroup");

const parceledDateGroup =
  document.getElementById("parceledDateGroup");


// ==========================================
// 7. MENU ELEMENTS
// ==========================================

const menuPopup =
  document.getElementById("menuPopup");

const editOption =
  document.getElementById("editOption");

const deleteOption =
  document.getElementById("deleteOption");


// ==========================================
// 8. CONFIRMATION ELEMENTS
// ==========================================

const confirmModal =
  document.getElementById("confirmModal");

const confirmTitle =
  document.getElementById("confirmTitle");

const confirmMessage =
  document.getElementById("confirmMessage");

const confirmCancel =
  document.getElementById("confirmCancel");

const confirmOk =
  document.getElementById("confirmOk");

const confirmIcon =
  document.getElementById("confirmIcon");


// ==========================================
// 9. TODAY'S DATE
// ==========================================

function getToday() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(now.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ==========================================
// 10. FORMAT DATE
// ==========================================

function formatDate(date) {

  if (!date) {
    return "";
  }

  const parts =
    String(date).split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// ==========================================
// 11. ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==========================================
// 12. CHANGE APP THEME
// ==========================================

function updateAppTheme() {

  if (!appContainer) {
    return;
  }

  appContainer.classList.remove(
    "arrived",
    "parceled"
  );

  if (currentPage === "arrived") {

    appContainer.classList.add("arrived");

  } else if (currentPage === "parceled") {

    appContainer.classList.add("parceled");
  }
}


// ==========================================
// 13. FIREBASE REAL-TIME LISTENER
// ==========================================

onSnapshot(
  processesRef,

  (snapshot) => {

    processes = [];

    snapshot.forEach((firebaseDoc) => {

      processes.push({
        id: firebaseDoc.id,
        ...firebaseDoc.data()
      });

    });


    // Newest given date first

    processes.sort((a, b) => {

  let dateA = "";
  let dateB = "";


  // ==============================
  // GIVEN PAGE
  // Sort by Given Date
  // ==============================

  if (currentPage === "given") {

    dateA = a.givenDate || "";
    dateB = b.givenDate || "";
  }


  // ==============================
  // ARRIVED PAGE
  // Sort by Delivery Date
  // ==============================

  else if (currentPage === "arrived") {

    dateA = a.deliveryDate || "";
    dateB = b.deliveryDate || "";
  }


  // ==============================
  // PARCELED PAGE
  // Sort by Parceled Date
  // ==============================

  else if (currentPage === "parceled") {

    dateA = a.parceledDate || "";
    dateB = b.parceledDate || "";
  }


  // Higher/latest date → TOP

  return dateB.localeCompare(dateA);
});


    renderCards();
  },

  (error) => {

    console.error(
      "Firebase listener error:",
      error
    );

    alert(
      "Firebase connection failed.\n\n" +
      error.message
    );
  }
);


// ==========================================
// 14. RENDER CARDS
// ==========================================

function renderCards() {

  if (!cardContainer) {
    return;
  }


  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  // Get current page items

let pageItems =
  processes.filter(
    item =>
      item.status === currentPage
  );


// ==========================================
// SORT CARDS BY IMPORTANT DATE
// ==========================================

pageItems.sort((a, b) => {

  let dateA = "";
  let dateB = "";


  // GIVEN PAGE
  // Given Date is important

  if (currentPage === "given") {

    dateA = a.givenDate || "";
    dateB = b.givenDate || "";
  }


  // ARRIVED PAGE
  // Delivery Date is important

  else if (currentPage === "arrived") {

    dateA = a.deliveryDate || "";
    dateB = b.deliveryDate || "";
  }


  // PARCELED PAGE
  // Parceled Date is important

  else if (currentPage === "parceled") {

    dateA = a.parceledDate || "";
    dateB = b.parceledDate || "";
  }


  // Latest / higher date → TOP

  return dateB.localeCompare(dateA);
});


  // Search party name or type

  if (search) {

    pageItems =
      pageItems.filter(item => {

        const party =
          String(
            item.partyName || ""
          ).toLowerCase();

        const type =
          String(
            item.type || ""
          ).toLowerCase();

        return (
          party.includes(search) ||
          type.includes(search)
        );
      });
  }


  // Total count without search

  const totalCount =
    processes.filter(
      item =>
        item.status === currentPage
    ).length;


  // Status text

  if (currentPage === "parceled") {

    statusText.textContent =
      `Completed : ${totalCount}`;

    statusSmall.textContent =
      "Sarees delivered & parceled";

  } else {

    statusText.textContent =
      `Pending : ${totalCount}`;

    if (currentPage === "given") {

      statusSmall.textContent =
        "Sarees to be delivered";

    } else {

      statusSmall.textContent =
        "Sarees ready for parcel";
    }
  }


  updateAppTheme();


  // No cards

  if (pageItems.length === 0) {

    cardContainer.innerHTML = `
      <div class="empty-state">

        <i class="fas fa-box-open"></i>

        <p>No processes found</p>

      </div>
    `;

    return;
  }


  // Create cards

  cardContainer.innerHTML =
    pageItems
      .map(item => createCard(item))
      .join("");
}


// ==========================================
// 15. CREATE CARD
// ==========================================

function createCard(item) {

  const id =
    escapeHTML(item.id);

  const partyName =
    escapeHTML(item.partyName);

  const totalSarees =
    escapeHTML(item.totalSarees);

  const type =
    escapeHTML(item.type);


  // ========================================
  // GIVEN CARD
  // ========================================

  if (item.status === "given") {

    return `
      <div class="process-card">

        <!-- LEFT -->
        <input
          type="checkbox"
          class="process-checkbox"
          data-id="${id}"
          aria-label="Move ${partyName} to Arrived"
        >


        <!-- CENTER -->
        <div class="card-info">

          <h3 class="party-name">
            ${partyName}
          </h3>

          <p class="card-line">
            ${totalSarees} sarees
          </p>

          <p class="card-type">
            ${type}
          </p>

          <div class="date-line">

            <i class="far fa-calendar"></i>

            <span>
              ${formatDate(item.givenDate)}
            </span>

          </div>

        </div>


        <!-- RIGHT -->
        <button
          class="more-btn"
          data-id="${id}"
          type="button"
          aria-label="More options"
        >

          <i class="fas fa-ellipsis-v"></i>

        </button>

      </div>
    `;
  }


  // ========================================
  // ARRIVED CARD
  // ========================================

  if (item.status === "arrived") {

    return `
      <div class="process-card">

        <!-- LEFT -->
        <input
          type="checkbox"
          class="process-checkbox"
          data-id="${id}"
          aria-label="Move ${partyName} to Parceled"
        >


        <!-- CENTER -->
        <div class="card-info">

          <h3 class="party-name">
            ${partyName}
          </h3>

          <p class="card-line">
            ${totalSarees} sarees
          </p>

          <p class="card-type">
            ${type}
          </p>

          <div class="date-line">

            <i class="far fa-calendar"></i>

            <span>
              Add date :
              ${formatDate(item.givenDate)}
            </span>

          </div>

          <div class="date-line">

            <i class="far fa-calendar-check"></i>

            <span>
              Delivery date :
              ${formatDate(item.deliveryDate)}
            </span>

          </div>

        </div>


        <!-- RIGHT -->
        <button
          class="more-btn"
          data-id="${id}"
          type="button"
          aria-label="More options"
        >

          <i class="fas fa-ellipsis-v"></i>

        </button>

      </div>
    `;
  }


  // ========================================
  // PARCELED CARD
  // ========================================

  if (item.status === "parceled") {

    return `
      <div class="process-card">

        <!-- LEFT EMPTY SPACE -->
        <div class="card-spacer"></div>


        <!-- CENTER -->
        <div class="card-info">

          <h3 class="party-name">
            ${partyName}
          </h3>

          <p class="card-line">
            ${totalSarees} sarees
          </p>

          <p class="card-type">
            ${type}
          </p>

          <div class="date-line">

            <i class="far fa-calendar"></i>

            <span>
              Given date :
              ${formatDate(item.givenDate)}
            </span>

          </div>

          <div class="date-line">

            <i class="far fa-calendar-check"></i>

            <span>
              Delivery date :
              ${formatDate(item.deliveryDate)}
            </span>

          </div>

          <div class="date-line">

            <i class="fas fa-check-circle"></i>

            <span>
              Parceled date :
              ${formatDate(item.parceledDate)}
            </span>

          </div>

        </div>


        <!-- RIGHT -->
        <button
          class="more-btn"
          data-id="${id}"
          type="button"
          aria-label="More options"
        >

          <i class="fas fa-ellipsis-v"></i>

        </button>

      </div>
    `;
  }


  return "";
}


// ==========================================
// 16. THREE DOT MENU
// ==========================================

cardContainer.addEventListener(
  "click",
  (event) => {

    const moreButton =
      event.target.closest(".more-btn");

    if (!moreButton) {
      return;
    }

    event.stopPropagation();


    selectedId =
      moreButton.dataset.id;


    const rect =
      moreButton.getBoundingClientRect();


    menuPopup.style.top =
      `${rect.bottom + 5}px`;


    menuPopup.style.left =
      `${Math.max(
        10,
        rect.right - 135
      )}px`;


    menuPopup.classList.add("show");
  }
);


// ==========================================
// 17. CHECKBOX MOVE
// ==========================================

cardContainer.addEventListener(
  "change",
  (event) => {

    if (
      !event.target.classList.contains(
        "process-checkbox"
      )
    ) {
      return;
    }


    const checkbox =
      event.target;


    const id =
      checkbox.dataset.id;


    const item =
      processes.find(
        process =>
          process.id === id
      );


    if (!item) {
      return;
    }


    // Return checkbox to empty
    // until user confirms

    checkbox.checked = false;


    selectedId = id;


    // GIVEN → ARRIVED

    if (item.status === "given") {

      showMoveConfirmation(
        item,
        "Move to Arrived?",
        "Do you want to move this card to Arrived page?",
        "arrived"
      );

      return;
    }


    // ARRIVED → PARCELED

    if (item.status === "arrived") {

      showMoveConfirmation(
        item,
        "Move to Parceled?",
        "Do you want to move this card to Parceled page?",
        "parceled"
      );
    }
  }
);


// ==========================================
// 18. CLOSE MENU OUTSIDE
// ==========================================

document.addEventListener(
  "click",
  (event) => {

    if (
      !event.target.closest(".more-btn") &&
      !event.target.closest("#menuPopup")
    ) {

      menuPopup.classList.remove(
        "show"
      );
    }
  }
);


// ==========================================
// 19. TAB SWITCHING
// ==========================================

tabs.forEach((tab, index) => {

  tab.addEventListener(
    "click",
    () => {

      currentPage =
        tab.dataset.page;


      tabs.forEach(t => {

        t.classList.remove(
          "active"
        );

      });


      tab.classList.add("active");


      // Move underline

      if (tabLine) {

        tabLine.style.transform =
          `translateX(${index * 100}%)`;
      }


      // Plus button only on Given

      if (currentPage === "given") {

        addBtn.style.display =
          "flex";

      } else {

        addBtn.style.display =
          "none";
      }


      // Clear search

      searchInput.value = "";


      renderCards();
    }
  );
});


// ==========================================
// 20. SEARCH
// ==========================================

searchInput.addEventListener(
  "input",
  () => {

    renderCards();

  }
);


// ==========================================
// 21. ADD BUTTON
// ==========================================

addBtn.addEventListener(
  "click",
  () => {

    if (currentPage !== "given") {
      return;
    }

    openAddForm();
  }
);


// ==========================================
// 22. OPEN ADD FORM
// ==========================================

function openAddForm() {

  processForm.reset();

  editIdInput.value = "";

  formTitle.textContent =
    "Add New Process";


  givenDateInput.value =
    getToday();


  givenDateGroup.style.display =
    "block";

  deliveryDateGroup.style.display =
    "none";

  parceledDateGroup.style.display =
    "none";


  formModal.classList.add(
    "show"
  );
}


// ==========================================
// 23. CLOSE FORM
// ==========================================

function closeForm() {

  formModal.classList.remove(
    "show"
  );


  processForm.reset();

  editIdInput.value = "";


  formTitle.textContent =
    "Add New Process";


  givenDateInput.value =
    getToday();


  givenDateGroup.style.display =
    "block";

  deliveryDateGroup.style.display =
    "none";

  parceledDateGroup.style.display =
    "none";
}


closeFormBtn.addEventListener(
  "click",
  closeForm
);


cancelFormBtn.addEventListener(
  "click",
  closeForm
);


// ==========================================
// 24. FORM BACKDROP
// ==========================================

formModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target === formModal
    ) {

      closeForm();
    }
  }
);


// ==========================================
// 25. SHOW FORM FIELDS
// ==========================================

function showFormFields(status) {

  // Given date is always visible
  givenDateGroup.classList.remove("hidden");
  givenDateGroup.style.setProperty(
    "display",
    "block",
    "important"
  );


  // First hide Delivery
  deliveryDateGroup.classList.add("hidden");
  deliveryDateGroup.style.setProperty(
    "display",
    "none",
    "important"
  );


  // First hide Parceled
  parceledDateGroup.classList.add("hidden");
  parceledDateGroup.style.setProperty(
    "display",
    "none",
    "important"
  );


  // ======================================
  // GIVEN
  // ======================================

  if (status === "given") {
    return;
  }


  // ======================================
  // ARRIVED
  // ======================================

  if (status === "arrived") {

    deliveryDateGroup.classList.remove(
      "hidden"
    );

    deliveryDateGroup.style.setProperty(
      "display",
      "block",
      "important"
    );

    return;
  }


  // ======================================
  // PARCELED
  // ======================================

  if (status === "parceled") {

    deliveryDateGroup.classList.remove(
      "hidden"
    );

    deliveryDateGroup.style.setProperty(
      "display",
      "block",
      "important"
    );


    parceledDateGroup.classList.remove(
      "hidden"
    );

    parceledDateGroup.style.setProperty(
      "display",
      "block",
      "important"
    );

    return;
  }
}


// ==========================================
// STOP PART 1
// PART 2 CONTINUES
// ==========================================
// ==========================================
// PROCESS MANAGEMENT
// FIREBASE VERSION
// PART 2 / 2
// ==========================================


// ==========================================
// 26. EDIT OPTION
// ==========================================

editOption.addEventListener(
  "click",
  () => {

    menuPopup.classList.remove(
      "show"
    );


    if (!selectedId) {
      return;
    }


    const item =
      processes.find(
        process =>
          process.id === selectedId
      );


    if (!item) {

      alert(
        "Process not found."
      );

      return;
    }


    openEditForm(item);
  }
);


// ==========================================
// 27. DELETE OPTION
// ==========================================

deleteOption.addEventListener(
  "click",
  () => {

    menuPopup.classList.remove(
      "show"
    );


    if (!selectedId) {
      return;
    }


    const item =
      processes.find(
        process =>
          process.id === selectedId
      );


    if (!item) {

      alert(
        "Process not found."
      );

      return;
    }


    showDeleteConfirmation(item);
  }
);


// ==========================================
// 28. OPEN EDIT FORM
// ==========================================

function openEditForm(item) {

  // Process ID
  editIdInput.value =
    item.id;


  // Basic details
  partyNameInput.value =
    item.partyName || "";

  totalSareesInput.value =
    item.totalSarees || "";

  sareeTypeInput.value =
    item.type || "";


  // ======================================
  // DATES
  // ======================================

  givenDateInput.value =
    item.givenDate || "";


  deliveryDateInput.value =
    item.deliveryDate || "";


  parceledDateInput.value =
    item.parceledDate || "";


  // ======================================
  // TITLE
  // ======================================

  formTitle.textContent =
    "Edit Process";


  // ======================================
  // SHOW CORRECT DATE FIELDS
  // ======================================

  showFormFields(
    item.status
  );


  // ======================================
  // OPEN MODAL
  // ======================================

  formModal.classList.add(
    "show"
  );
}


// ==========================================
// 29. SAVE ADD / EDIT
// ==========================================

processForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    if (isSaving) {
      return;
    }


    const partyName =
      partyNameInput.value.trim();


    const totalSarees =
      totalSareesInput.value.trim();


    const type =
      sareeTypeInput.value;


    const givenDate =
      givenDateInput.value;


    // Validate

    if (
      !partyName ||
      !totalSarees ||
      !type ||
      !givenDate
    ) {

      alert(
        "Please fill all fields."
      );

      return;
    }


    isSaving = true;


    try {

      const editingId =
        editIdInput.value;


      // ====================================
      // EDIT EXISTING PROCESS
      // ====================================

      if (editingId) {

        const item =
          processes.find(
            process =>
              process.id === editingId
          );


        if (!item) {

          alert(
            "Process not found."
          );

          return;
        }


        let updateData = {

          partyName:
            partyName,

          totalSarees:
            totalSarees,

          type:
            type,

          givenDate:
            givenDate
        };


        // ARRIVED

        if (
          item.status === "arrived"
        ) {

          updateData.deliveryDate =
            deliveryDateInput.value;
        }


        // PARCELED

        if (
          item.status === "parceled"
        ) {

          updateData.deliveryDate =
            deliveryDateInput.value;

          updateData.parceledDate =
            parceledDateInput.value;
        }


        await updateDoc(

          doc(
            db,
            "processes",
            editingId
          ),

          updateData
        );


        closeForm();


      


        return;
      }


      // ====================================
      // ADD NEW PROCESS
      // ====================================

      await addDoc(

        processesRef,

        {

          partyName:
            partyName,

          totalSarees:
            totalSarees,

          type:
            type,

          givenDate:
            givenDate,

          status:
            "given",

          deliveryDate:
            "",

          parceledDate:
            "",

          createdAt:
            Date.now()
        }
      );


      closeForm();


      


    } catch (error) {

      console.error(
        "Save error:",
        error
      );


      alert(
        "Save failed.\n\n" +
        error.message
      );


    } finally {

      isSaving = false;
    }
  }
);


// ==========================================
// 30. MOVE CONFIRMATION
// ==========================================

function showMoveConfirmation(
  item,
  title,
  message,
  destination
) {

  confirmTitle.textContent =
    title;


  confirmMessage.textContent =
    message;


  confirmIcon.innerHTML =
    '<i class="fas fa-truck"></i>';


  confirmOk.textContent =
    "OK";


  confirmOk.style.background =
    "#54227a";


  confirmAction =
    async () => {

      if (
        !item ||
        !item.id
      ) {

        throw new Error(
          "Invalid process ID."
        );
      }


      // ==================================
      // GIVEN → ARRIVED
      // ==================================

      if (
        destination === "arrived"
      ) {

        await updateDoc(

          doc(
            db,
            "processes",
            item.id
          ),

          {

            status:
              "arrived",

            // Keep original Given date

            givenDate:
              item.givenDate ||
              getToday(),

            // Today's date becomes
            // Delivery date

            deliveryDate:
              getToday()
          }
        );


        return;
      }


      // ==================================
      // ARRIVED → PARCELED
      // ==================================

      if (
        destination === "parceled"
      ) {

        await updateDoc(

          doc(
            db,
            "processes",
            item.id
          ),

          {

            status:
              "parceled",

            // Keep original Given date

            givenDate:
              item.givenDate ||
              getToday(),

            // Keep original Delivery date

            deliveryDate:
              item.deliveryDate ||
              getToday(),

            // Today's date becomes
            // Parceled date

            parceledDate:
              getToday()
          }
        );


        return;
      }


      throw new Error(
        "Unknown destination."
      );
    };


  confirmModal.classList.add(
    "show"
  );
}


// ==========================================
// 31. DELETE CONFIRMATION
// ==========================================

function showDeleteConfirmation(item) {

  confirmTitle.textContent =
    "Delete this card?";


  confirmMessage.textContent =
    `Are you sure you want to delete ${item.partyName || "this card"}?`;


  confirmIcon.innerHTML =
    '<i class="fas fa-trash"></i>';


  confirmOk.textContent =
    "Yes, Delete";


  confirmOk.style.background =
    "#d32f2f";


  confirmAction =
    async () => {

      if (
        !item ||
        !item.id
      ) {

        throw new Error(
          "Invalid process ID."
        );
      }


      await deleteDoc(

        doc(
          db,
          "processes",
          item.id
        )
      );
    };


  confirmModal.classList.add(
    "show"
  );
}


// ==========================================
// 32. CONFIRM OK
// ==========================================

confirmOk.addEventListener(
  "click",
  async () => {

    if (!confirmAction) {
      return;
    }


    const action =
      confirmAction;


    confirmAction = null;


    confirmOk.disabled =
      true;


    try {

      await action();


      confirmModal.classList.remove(
        "show"
      );


      selectedId = null;


    } catch (error) {

      console.error(
        "Action error:",
        error
      );


      alert(
        "Operation failed.\n\n" +
        error.message
      );


      // Allow retry

      confirmAction =
        action;


    } finally {

      confirmOk.disabled =
        false;
    }
  }
);


// ==========================================
// 33. CONFIRM CANCEL
// ==========================================

confirmCancel.addEventListener(
  "click",
  () => {

    confirmModal.classList.remove(
      "show"
    );


    selectedId = null;

    confirmAction = null;
  }
);


// ==========================================
// 34. CONFIRM BACKDROP
// ==========================================

confirmModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      confirmModal
    ) {

      confirmModal.classList.remove(
        "show"
      );


      selectedId = null;

      confirmAction = null;
    }
  }
);


// ==========================================
// 35. INITIAL FORM DATE
// ==========================================

givenDateInput.value =
  getToday();


// ==========================================
// 36. INITIAL PAGE
// ==========================================

currentPage =
  "given";


tabs.forEach(
  (tab, index) => {

    if (index === 0) {

      tab.classList.add(
        "active"
      );

    } else {

      tab.classList.remove(
        "active"
      );
    }
  }
);


// ==========================================
// 37. INITIAL UNDERLINE
// ==========================================

if (tabLine) {

  tabLine.style.transform =
    "translateX(0%)";
}


// ==========================================
// 38. INITIAL PLUS BUTTON
// ==========================================

if (addBtn) {

  addBtn.style.display =
    "flex";
}


// ==========================================
// 39. FIRST RENDER
// ==========================================

renderCards();


// ==========================================
// DONE
// ==========================================