const ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHABET_SIZE = ENGLISH_ALPHABET.length; // 26

class VigenereGammaCipher {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.displayWelcomeMessage();
  }

  // Display encryption analysis
  displayAnalysis(steps, operation, plaintext, key, result) {
    const operationName = operation === "encrypt" ? "Encryption" : "Decryption";
    const normalizedPlain = this.normalizeText(plaintext);
    const normalizedKey = this.normalizeText(key);

    let html = `
                <div class="analysis-header">
                    <h4 style="color: var(--accent-primary); margin-bottom: 1rem;">Description</h4>
                </div>`;
  }

  initializeElements() {
    this.plaintextArea = document.getElementById("plaintext");
    this.keyArea = document.getElementById("key");
    this.ciphertextArea = document.getElementById("ciphertext");
    this.encryptBtn = document.getElementById("encryptBtn");
    this.decryptBtn = document.getElementById("decryptBtn");
    this.clearBtn = document.getElementById("clearBtn");
    this.generateKeyBtn = document.getElementById("generateKey");
    this.analysisResult = document.getElementById("analysisResult");
    this.fileInput = document.getElementById("fileInput");
    this.loadFileBtn = document.getElementById("loadFileBtn");
    this.downloadBtn = document.getElementById("downloadBtn");
  }

  attachEventListeners() {
    this.encryptBtn.addEventListener("click", () => this.encrypt());
    this.decryptBtn.addEventListener("click", () => this.decrypt());
    this.clearBtn.addEventListener("click", () => this.clearAll());
    this.generateKeyBtn.addEventListener("click", () =>
      this.generateRandomKey()
    );
    this.loadFileBtn.addEventListener("click", () => this.loadFile());
    this.fileInput.addEventListener("change", (e) => this.handleFileLoad(e));
    this.downloadBtn.addEventListener("click", () => this.downloadResult());
  }

  displayWelcomeMessage() {
    this.analysisResult.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h4 style="color: var(--accent-primary); margin-bottom: 1rem;">Ready to work!</h4>
                <p style="color: var(--text-secondary);">Enter text and key, then choose Encrypt or Decrypt</p>
            </div>
        `;
  }

  normalizeText(text) {
    return text
      .toUpperCase()
      .split("")
      .filter((char) => ENGLISH_ALPHABET.includes(char))
      .join("");
  }

  validateEnglishText(text) {
    const hasNonEnglish = text
      .split("")
      .some((char) => char.match(/[a-zA-Z]/) === null && char.trim() !== "");
    return !hasNonEnglish;
  }

  getCharIndex(char) {
    return ENGLISH_ALPHABET.indexOf(char);
  }

  getCharByIndex(index) {
    return ENGLISH_ALPHABET[index];
  }

  numberToBinary(num) {
    return num.toString(2).padStart(5, "0");
  }

  binaryToNumber(binary) {
    return parseInt(binary, 2);
  }

  xorBinary(bin1, bin2) {
    let result = "";
    for (let i = 0; i < bin1.length; i++) {
      result += bin1[i] === bin2[i] ? "0" : "1";
    }
    return result;
  }

  encryptText(plaintext, key) {
    const normalizedPlain = this.normalizeText(plaintext);
    const normalizedKey = this.normalizeText(key);

    if (normalizedPlain.length === 0) {
      throw new Error("Text must contain English letters");
    }

    if (normalizedKey.length === 0) {
      throw new Error("Key must contain English letters");
    }

    let result = "";
    const steps = [];

    for (let i = 0; i < normalizedPlain.length; i++) {
      const plainChar = normalizedPlain[i];
      const keyChar = normalizedKey[i % normalizedKey.length];

      const plainIndex = this.getCharIndex(plainChar);
      const keyIndex = this.getCharIndex(keyChar);

      const plainBinary = this.numberToBinary(plainIndex);
      const keyBinary = this.numberToBinary(keyIndex);

      const xorResult = this.xorBinary(plainBinary, keyBinary);
      const xorNumber = this.binaryToNumber(xorResult);

      const cipherIndex = (plainIndex + keyIndex) % ALPHABET_SIZE;
      const cipherChar = this.getCharByIndex(cipherIndex);

      result += cipherChar;

      steps.push({
        position: i + 1,
        plainChar,
        plainIndex,
        plainBinary,
        keyChar,
        keyIndex,
        keyBinary,
        xorResult,
        xorNumber,
        cipherChar,
        cipherIndex,
        calculation: `(${plainIndex} + ${keyIndex}) mod ${ALPHABET_SIZE} = ${cipherIndex}`,
      });
    }

    return { result, steps };
  }

  decryptText(ciphertext, key) {
    const normalizedCipher = this.normalizeText(ciphertext);
    const normalizedKey = this.normalizeText(key);

    if (normalizedCipher.length === 0) {
      throw new Error("Ciphertext must contain English letters");
    }

    if (normalizedKey.length === 0) {
      throw new Error("Key must contain English letters");
    }

    let result = "";
    const steps = [];

    for (let i = 0; i < normalizedCipher.length; i++) {
      const cipherChar = normalizedCipher[i];
      const keyChar = normalizedKey[i % normalizedKey.length];

      const cipherIndex = this.getCharIndex(cipherChar);
      const keyIndex = this.getCharIndex(keyChar);

      const cipherBinary = this.numberToBinary(cipherIndex);
      const keyBinary = this.numberToBinary(keyIndex);

      const xorResult = this.xorBinary(cipherBinary, keyBinary);
      const xorNumber = this.binaryToNumber(xorResult);

      const plainIndex =
        (cipherIndex - keyIndex + ALPHABET_SIZE) % ALPHABET_SIZE;
      const plainChar = this.getCharByIndex(plainIndex);

      result += plainChar;

      steps.push({
        position: i + 1,
        cipherChar,
        cipherIndex,
        cipherBinary,
        keyChar,
        keyIndex,
        keyBinary,
        xorResult,
        xorNumber,
        plainChar,
        plainIndex,
        calculation: `(${cipherIndex} - ${keyIndex} + ${ALPHABET_SIZE}) mod ${ALPHABET_SIZE} = ${plainIndex}`,
      });
    }

    return { result, steps };
  }

  encrypt() {
    try {
      const plaintext = this.plaintextArea.value.trim();
      const key = this.keyArea.value.trim();

      if (!plaintext) {
        this.showError("Enter text to encrypt");
        return;
      }

      if (!this.validateEnglishText(plaintext)) {
        this.showError(
          "Plaintext must contain only English letters and spaces"
        );
        return;
      }

      if (!key) {
        this.showError("Enter key for encryption");
        return;
      }

      this.showLoading();

      setTimeout(() => {
        const { result, steps } = this.encryptText(plaintext, key);
        this.ciphertextArea.value = result;
        this.displayAnalysis(steps, "encrypt", plaintext, key, result);
        this.showSuccess("Text encrypted successfully!");
      }, 300);
    } catch (error) {
      this.showError(error.message);
    }
  }

  decrypt() {
    try {
      const ciphertext = this.plaintextArea.value.trim();
      const key = this.keyArea.value.trim();

      if (!ciphertext) {
        this.showError("Enter ciphertext in Plaintext field to decrypt");
        return;
      }

      if (!key) {
        this.showError("Enter key for decryption");
        return;
      }

      this.showLoading();

      setTimeout(() => {
        const { result, steps } = this.decryptText(ciphertext, key);
        this.ciphertextArea.value = result;
        this.displayAnalysis(steps, "decrypt", result, key, ciphertext);
        this.showSuccess("Text decrypted successfully!");
      }, 300);
    } catch (error) {
      this.showError(error.message);
    }
  }

  generateRandomKey() {
    const plaintextLength = this.normalizeText(this.plaintextArea.value).length;
    const keyLength = plaintextLength > 0 ? plaintextLength : 10;

    let randomKey = "";
    for (let i = 0; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * ALPHABET_SIZE);
      randomKey += this.getCharByIndex(randomIndex);
    }

    this.keyArea.value = randomKey;
    this.showSuccess(`Generated random key with ${keyLength} characters`);
  }

  runExample() {
    this.plaintextArea.value = "HELLO";
    this.keyArea.value = "WORLD";

    setTimeout(() => {
      this.encrypt();
    }, 100);
  }

  clearAll() {
    this.plaintextArea.value = "";
    this.keyArea.value = "";
    this.ciphertextArea.value = "";
    this.displayWelcomeMessage();
    this.showSuccess("All fields cleared");
  }

  loadFile() {
    this.fileInput.click();
  }

  handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      this.showError("Please select a text file (.txt)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;

        if (!content || content.trim() === "") {
          this.showError("The selected file is empty");
          return;
        }

        if (!this.validateEnglishText(content)) {
          this.showError("File must contain only English letters and spaces");
          return;
        }

        this.plaintextArea.value = content;
        this.showSuccess(`File "${file.name}" loaded successfully`);
      } catch (error) {
        this.showError("Error reading file: " + error.message);
      }
    };

    reader.onerror = () => {
      this.showError("Error reading file");
    };

    reader.readAsText(file);
  }

  downloadResult() {
    const result = this.ciphertextArea.value.trim();

    if (!result) {
      this.showError(
        "No result to download. Please encrypt or decrypt text first."
      );
      return;
    }

    try {
      const blob = new Blob([result], { type: "text/plain;charset=utf-8" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.download = `cipher-result-${timestamp}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      this.showSuccess("Result downloaded successfully!");
    } catch (error) {
      this.showError("Error downloading file: " + error.message);
    }
  }

  displayAnalysis(steps, operation, plaintext, key, result) {
    const operationName = operation === "encrypt" ? "Encryption" : "Decryption";
    const normalizedPlain = this.normalizeText(plaintext);
    const normalizedKey = this.normalizeText(key);

    let html = `
            <div class="analysis-summary">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <strong style="color: var(--accent-secondary);">Original Text:</strong><br>
                        <code style="color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">${
                          operation === "encrypt" ? normalizedPlain : result
                        }</code>
                    </div>
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <strong style="color: var(--accent-warning);">Key:</strong><br>
                        <code style="color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">${normalizedKey}</code>
                    </div>
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <strong style="color: var(--accent-primary);">Result:</strong><br>
                        <code style="color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">${
                          operation === "encrypt" ? result : normalizedPlain
                        }</code>
                    </div>
                </div>
            </div>

            <div class="step-by-step">
                <h5 style="color: var(--accent-purple); margin-bottom: 1rem;">Step-by-step Modular Arithmetic Calculations:</h5>
                <table class="analysis-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${
                              operation === "encrypt" ? "Char (M)" : "Char (C)"
                            }</th>
                            <th>Index</th>
                            <th>Binary</th>
                            <th>Key (K)</th>
                            <th>Key Index</th>
                            <th>Key Binary</th>
                            <th>Calculation</th>
                            <th>${
                              operation === "encrypt"
                                ? "Result (C)"
                                : "Result (M)"
                            }</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    steps.forEach((step) => {
      if (operation === "encrypt") {
        html += `
                    <tr>
                        <td>${step.position}</td>
                        <td style="color: var(--accent-secondary); font-weight: bold;">${step.plainChar}</td>
                        <td>${step.plainIndex}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; color: var(--accent-secondary);">${step.plainBinary}</td>
                        <td style="color: var(--accent-warning); font-weight: bold;">${step.keyChar}</td>
                        <td>${step.keyIndex}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; color: var(--accent-warning);">${step.keyBinary}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">${step.calculation}</td>
                        <td style="color: var(--accent-primary); font-weight: bold;">${step.cipherChar} (${step.cipherIndex})</td>
                    </tr>
                `;
      } else {
        html += `
                    <tr>
                        <td>${step.position}</td>
                        <td style="color: var(--accent-danger); font-weight: bold;">${step.cipherChar}</td>
                        <td>${step.cipherIndex}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; color: var(--accent-danger);">${step.cipherBinary}</td>
                        <td style="color: var(--accent-warning); font-weight: bold;">${step.keyChar}</td>
                        <td>${step.keyIndex}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; color: var(--accent-warning);">${step.keyBinary}</td>
                        <td style="font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">${step.calculation}</td>
                        <td style="color: var(--accent-secondary); font-weight: bold;">${step.plainChar} (${step.plainIndex})</td>
                    </tr>
                `;
      }
    });

    html += `
                    </tbody>
                </table>
            </div>
        `;

    this.analysisResult.innerHTML = html;
  }

  showError(message) {
    this.showMessage(message, "error");
  }

  showSuccess(message) {
    this.showMessage(message, "success");
  }

  showLoading() {
    this.analysisResult.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="display: inline-block; margin-bottom: 1rem;">
                    <div style="width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                <p style="color: var(--text-secondary);">Processing data...</p>
            </div>
        `;
  }

  showMessage(message, type) {
    const colors = {
      error: "var(--accent-danger)",
      success: "var(--accent-secondary)",
      warning: "var(--accent-warning)",
      info: "var(--accent-primary)",
    };

    const icons = {
      error: "❌",
      success: "✅",
      warning: "⚠️",
      info: "ℹ️",
    };

    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid ${colors[type]};
            border-radius: 8px;
            padding: 1rem 1.5rem;
            color: var(--text-primary);
            box-shadow: var(--shadow-strong);
            z-index: 1000;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

    notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${icons[type]}</span>
                <span>${message}</span>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const plaintextArea = document.getElementById("plaintext");
  const keyArea = document.getElementById("key");
  const ciphertextArea = document.getElementById("ciphertext");

  if (plaintextArea) plaintextArea.value = "";
  if (keyArea) keyArea.value = "";
  if (ciphertextArea) ciphertextArea.value = "";

  new VigenereGammaCipher();
});
