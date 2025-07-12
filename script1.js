const container = document.getElementById("array-container");
const speedSlider = document.getElementById("speed");
const sizeSlider = document.getElementById("size");
const stepCounter = document.getElementById("step-counter");

const compareSound = document.getElementById("compareSound");

let array = [];
let delay = 100;
let steps = 0;
let isPaused = false;
let pausePromise = null;
let resume = null;
let cancelSort = false;

function generateArray() {
  const size = parseInt(sizeSlider.value);
  array = [];
  steps = 0;
  stepCounter.innerText = `Steps: ${steps}`;
  container.innerHTML = "";

  for (let i = 0; i < size; i++) {
    const value = Math.floor(Math.random() * 300) + 20;
    array.push(value);

    const barWrapper = document.createElement("div");
    barWrapper.classList.add("bar-wrapper");

    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.innerText = value;

    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value}px`;
    bar.style.backgroundColor = getColor(value);

    barWrapper.appendChild(bar);
    barWrapper.appendChild(circle);
    container.appendChild(barWrapper);
  }
}
function pauseResumeSort() {
  isPaused = !isPaused;
  if (!isPaused && resume) {
    resume();
  }
}

async function checkPaused() {
  while (isPaused) {
    await new Promise(resolve => {
      resume = resolve;
      pausePromise = resume;
    });
  }
}

function getColor(value) {
  const hue = Math.floor((value / 320) * 240);
  return `hsl(${hue}, 80%, 50%)`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateBar(index) {
  const wrapper = container.children[index];
  const bar = wrapper.querySelector(".bar");
  const circle = wrapper.querySelector(".circle");
  bar.style.height = `${array[index]}px`;
  bar.style.backgroundColor = getColor(array[index]);
  circle.innerText = array[index];
}

function highlight(index1, index2, color) {
  const wrapper1 = container.children[index1];
  const wrapper2 = container.children[index2];
  wrapper1.querySelector(".circle").style.backgroundColor = color;
  wrapper2.querySelector(".circle").style.backgroundColor = color;
}

function resetHighlight(index1, index2) {
  const wrapper1 = container.children[index1];
  const wrapper2 = container.children[index2];
  wrapper1.querySelector(".circle").style.backgroundColor = "white";
  wrapper2.querySelector(".circle").style.backgroundColor = "white";
}

function updateSteps() {
  steps++;
  stepCounter.innerText = `Steps: ${steps}`;
}

// 🔊 Play comparison sound with speed adjusted
function playComparisonSound() {
  if (!compareSound) return;
  compareSound.pause();
  compareSound.currentTime = 0;
  compareSound.playbackRate = getAudioSpeed();
  compareSound.play().catch(() => {});
}

function getAudioSpeed() {
  const minRate = 0.5;
  const maxRate = 2.0;
  const speed = 1000 - parseInt(speedSlider.value);
  return minRate + (speed / 1000) * (maxRate - minRate);
}

// 🔵 Bubble Sort
async function bubbleSort() {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (cancelSort) return; // Stop sorting if cancelSort is true
      await checkPaused();
      highlight(j, j + 1, "lightcoral");
      playComparisonSound();

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        updateBar(j);
        updateBar(j + 1);
        updateSteps();
      }

      await sleep(delay);
      resetHighlight(j, j + 1);
    }
  }
}

// 🟠 Insertion Sort
async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > key) {
      if (cancelSort) return;
      await checkPaused();
      highlight(j, j + 1, "orange");
      playComparisonSound();

      array[j + 1] = array[j];
      updateBar(j + 1);
      updateSteps();
      j--;
      await sleep(delay);
    }

    array[j + 1] = key;
    updateBar(j + 1);
    resetHighlight(j, j + 1);
    await sleep(delay);
  }
}

// 🔵 Merge Sort
async function mergeSort(start = 0, end = array.length - 1) {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid);
  await mergeSort(mid + 1, end);
  await merge(start, mid, end);
}

async function merge(start, mid, end) {
  const left = array.slice(start, mid + 1);
  const right = array.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;

  while (i < left.length && j < right.length) {
    if (cancelSort) return;
    await checkPaused();
    highlight(k, k, "lightblue");
    playComparisonSound();

    if (left[i] <= right[j]) {
      array[k] = left[i++];
    } else {
      array[k] = right[j++];
    }

    updateBar(k);
    updateSteps();
    await sleep(delay);
    resetHighlight(k, k);
    k++;
  }

  while (i < left.length) {
    array[k] = left[i++];
    updateBar(k);
    updateSteps();
    await sleep(delay);
    k++;
  }

  while (j < right.length) {
    array[k] = right[j++];
    updateBar(k);
    updateSteps();
    await sleep(delay);
    k++;
  }
}

// 🟣 Quick Sort
async function quickSort(start = 0, end = array.length - 1) {
  if (start < end) {
    const p = await partition(start, end);
    await quickSort(start, p - 1);
    await quickSort(p + 1, end);
  }
}

async function partition(low, high) {
  let pivot = array[high];
  let i = low;

  for (let j = low; j < high; j++) {
    if (cancelSort) return;
    await checkPaused();
    highlight(j, high, "purple");
    playComparisonSound();

    if (array[j] < pivot) {
      [array[i], array[j]] = [array[j], array[i]];
      updateBar(i);
      updateBar(j);
      updateSteps();
      i++;
    }

    await sleep(delay);
    resetHighlight(j, high);
  }

  [array[i], array[high]] = [array[high], array[i]];
  updateBar(i);
  updateBar(high);
  updateSteps();

  return i;
}

// 🟡 Selection Sort
async function selectionSort() {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (cancelSort) return;
      await checkPaused();
      highlight(minIdx, j, "crimson");
      playComparisonSound();

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }

      await sleep(delay);
      resetHighlight(minIdx, j);
    }

    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      updateBar(i);
      updateBar(minIdx);
      updateSteps();
      await sleep(delay);
    }
  }
}

// 🟤 Heap Sort
async function heapSort() {
  const n = array.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    updateBar(0);
    updateBar(i);
    updateSteps();
    await sleep(delay);
    await heapify(i, 0);
  }
}

async function heapify(n, i) {
  let largest = i;
  let l = 2 * i + 1;
  let r = 2 * i + 2;

  if (l < n && array[l] > array[largest]) largest = l;
  if (r < n && array[r] > array[largest]) largest = r;

  if (largest !== i) {
    if (cancelSort) return;
    await checkPaused();
    highlight(i, largest, "teal");
    playComparisonSound();

    [array[i], array[largest]] = [array[largest], array[i]];
    updateBar(i);
    updateBar(largest);
    updateSteps();
    await sleep(delay);
    resetHighlight(i, largest);
    await heapify(n, largest);
  }
}

// 🚀 Start Sorting
function startSort() {
  cancelSort = false;
  delay = 1000 - parseInt(speedSlider.value);
  steps = 0;
  stepCounter.innerText = "Steps: 0";

  const algorithm = document.getElementById("algorithm").value;
  switch (algorithm) {
    case "bubble": bubbleSort(); break;
    case "insertion": insertionSort(); break;
    case "merge": mergeSort(); break;
    case "quick": quickSort(); break;
    case "selection": selectionSort(); break;
    case "heap": heapSort(); break;
  }
}
function resetSort() {
  cancelSort = true;      // Stop any ongoing sort
  isPaused = false;       // Unpause if paused
  if (resume) resume();   // Resume any paused promise
  setTimeout(() => {
    generateArray();      // Generate a new array
    steps = 0;
    stepCounter.innerText = "Steps: 0";
  }, 50); // Small delay to ensure ongoing sorts exit
}
document.addEventListener("DOMContentLoaded", () => {
  generateArray();
  sizeSlider.addEventListener("input", generateArray);

  const nightModeToggle = document.getElementById("night-mode-toggle");
  if (nightModeToggle) {
    nightModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("night-mode");
    });
  }

  const algorithmDescriptions = {
    bubble: "Bubble Sort repeatedly swaps adjacent elements if they are in wrong order. O(n²) time complexity.",
    insertion: "Insertion Sort builds the sorted array one element at a time by inserting each element into its correct position. O(n²) time complexity.",
    merge: "Merge Sort divides the array, sorts and merges them. O(n log n) time complexity.",
    quick: "Quick Sort picks a pivot, partitions and sorts recursively. O(n log n) average time complexity.",
    selection: "Selection Sort repeatedly selects the minimum element and swaps it. O(n²) time complexity.",
    heap: "Heap Sort builds a max heap and extracts the largest element repeatedly. O(n log n) time complexity."
  };

  const algorithmSelect = document.getElementById("algorithm");
  const algorithmDescription = document.getElementById("algorithm-description");

  if (algorithmSelect && algorithmDescription) {
    algorithmSelect.addEventListener("change", () => {
      const algo = algorithmSelect.value;
      algorithmDescription.innerText = algorithmDescriptions[algo] || "";
    });

    // Initialize description on load
    algorithmDescription.innerText = algorithmDescriptions[algorithmSelect.value];
  }
});