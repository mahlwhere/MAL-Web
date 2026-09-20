// js/terminal.js
import { ui } from './ui.js';

function toggleTerminal() {
  ui.term.drawer.classList.toggle('open');
  if (ui.term.drawer.classList.contains('open')) {
    ui.term.input.focus();
  }
}

if (ui.term.toggleBtn) {
  ui.term.toggleBtn.addEventListener('click', toggleTerminal);
  ui.term.closeBtn.addEventListener('click', toggleTerminal);
}

window.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    e.preventDefault();
    toggleTerminal();
  }
});

if (ui.term.input) {
  ui.term.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawCmd = ui.term.input.value.trim();
      ui.term.input.value = '';
      if (!rawCmd) return;

      printOutput(`$ ${rawCmd}`);
      handleCommand(rawCmd.toLowerCase());
      ui.term.output.scrollTop = ui.term.output.scrollHeight;
    }
  });
}

function printOutput(text, isError = false) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  if (isError) line.style.color = '#f85149';
  line.textContent = text;
  ui.term.output.appendChild(line);
}

function handleCommand(cmd) {
  switch (cmd) {
    case 'help':
      printOutput("Available commands:");
      printOutput("help       - show this manual");
      printOutput("clear      - wipe terminal screen");
      printOutput("fastfetch  - print system summary");
      printOutput("theme light- switch to light theme");
      printOutput("theme dark - switch to dark theme");
      printOutput("repo       - link to MAL-Web GitHub repo");
      printOutput("ellie      - ???");
      break;
    case 'clear':
      ui.term.output.innerHTML = '';
      break;
    case 'fastfetch':
    case 'neofetch':
      printOutput("OS: Arch Linux x86_64");
      printOutput("Host: mahlarch");
      printOutput("VPS: Debian 12 (OVH)");
      printOutput("Stack: Caddy/Docker");
      break;
    case 'theme light':
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      printOutput("Theme set to light.");
      break;
    case 'theme dark':
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      printOutput("Theme set to dark.");
      break;
    case 'repo':
      window.open('https://github.com/mahlwhere/MAL-Web', '_blank');
      printOutput("Opening GitHub repository...");
      break;
case 'ellie':
      // The backticks let you paste multi-line strings perfectly intact
      const goldenArt = `     
                                   ::::::::::::                         
                              :::::---:::::-::::::                      
                         :::  ::::---------=****=:::                    
                      ::::::::::---===---=**%@@@@*--:                   
                     :::--::::-===--===---**%@@@@%**=::                 
                   ::::-:::-===*==-:-===--=*****%%**-:-::               
                  ::::::::-*%@%%%*-----=--==********=--*-               
                 :-::::-:=@*@@%%*==--::--------=*****=-*=-              
               :-=-:::::=%*%@@%*=-==---::::-=--:::-=====*=              
             :::=**----=---=**==--==--::-:-----::-:::=--*%=             
             :-*****==*-:::--=--:----::-:-****%%@@@@*:=*-**             
            :=***=**==-::::--=-::----:---***%@@@@@@@@=:-*=*:            
           :=**%%=*%**--:-::--::----::-=***@@@@@@@@@@%=:-=*-            
           -=*%%*=%%%*=------::::---:::-**%@@@%@@@@@@**=-**-::          
           -**@*-=*%%%*------:::::--:::-=*%%%@@@@@@@%%*****--:          
          :=**@*==*%*%*===-::-------::::-***%@@@@@@@%%***%*=-:          
        ::=***@=**@%*****=--=*%=-::::::--=**%%@@@@@%%%%**%*-:           
      ::--=**%***%@%****%**-=*@@@*=::::--=***%@@@@@@%%@%***-:           
     ::-==***%***%%%*******==*%@@@@@*===**%@@@@@@@@@%%%****=-:          
::::::-=**=**@%****@*%%%********%@@@@@@@*****%%%@@%%%%%*****-:-:        
-::::-******@@******%@@%**%%********%@@@@@===*%%%%%**********=          
--=-=**%**%@********%%@%***%***********%@@@*%@********%%*****-          
==******%%*==*****=***%%%*****%***%%%%%%%@@@@@%**%%@@@@@*****-          
==*********===****=****%***%**%%*%%%%%%%%%%**%%@@@@@@@%******:          
******************=*****%*%%%%%%%%%%%%%%%****%***************:          
*****************=*=****%***%%%%%%%%%%%%%*%***%%*%%%%%%******=          
**************************%%%%%@@%%%%%%%%%**%*%%%%%%%*********-         
*****%%%******************%%%*%%%%%%%%%%%%%%%*%%%%%%%%%%*****=::        
*%%%*****************%%%%@@%%*%%%%%%%%%%%%%%%*%%%%%%%%%%****            
%%%%%****%%******%***%%%%@@@@@%%@@@%%**%%%%%%%*%%%%%%%%*%**:   

Good girl.
      `;
      printOutput(goldenArt);
      break;
    default:
      printOutput(`command not found: ${cmd}. Type 'help' for options.`, true);
  }
}