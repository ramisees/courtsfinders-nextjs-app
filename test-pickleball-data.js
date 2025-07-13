const fs = require('fs');

// Read the TypeScript file and extract the data
const tsFileContent = fs.readFileSync('src/data/nc-courts.ts', 'utf8');

// Extract the court data array from the TypeScript file
const courtDataStart = tsFileContent.indexOf('[');
const courtDataEnd = tsFileContent.lastIndexOf(']') + 1;
const courtDataString = tsFileContent.substring(courtDataStart, courtDataEnd);

// Parse the court data (this is a simplified approach)
try {
  // Create a simple function to evaluate the court data
  const evalCode = `
    const courts = ${courtDataString};
    console.log('Total courts:', courts.length);
    
    const pickleballCourts = courts.filter(court => 
      court.sports.some(s => s.toLowerCase().includes('pickleball'))
    );
    console.log('Pickleball courts:', pickleballCourts.length);
    
    if (pickleballCourts.length > 0) {
      console.log('\\nPickleball courts found:');
      pickleballCourts.forEach(court => {
        console.log('-', court.name, '|', court.sports.join(', '));
      });
    } else {
      console.log('No pickleball courts found');
    }
  `;
  
  eval(evalCode);
} catch (error) {
  console.error('Error parsing court data:', error);
}
