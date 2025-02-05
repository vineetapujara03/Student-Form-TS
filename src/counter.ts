import axios, { AxiosResponse } from "axios";


interface Student{
  id?: number;
  name: string;
  age:number;
  grade:string;
  mark:number;
}


const api_url = 'http://localhost:3000/students/marks'; 
const api_url2 ='http://localhost:3000/students';




const content :HTMLElement | null = document.getElementById('content');
const studentListLink = document.getElementById('studentListLink');
const studentUpdateLink = document.getElementById('studentUpdateLink');

// async function getData():Promise<Student[][]>{

// const students : Student[][] = await Promise.all([grabStudentsMarks()]);
// return students;
// }

async function grabStudents(): Promise<Student[]> {
  const response: AxiosResponse =  await axios.get<Student[]>(api_url);
  
 const demo : Student[] = response.data as Student[];
  return demo as Student[];
}


async function saveStudentToAPI(student:Student): Promise<void> {
 await axios.post(api_url2,student);
}


async function listStudents() {
    const students :Student[] = await grabStudents();
    
    if (students.length === 0) {
      if(content)  
      content.innerHTML = "<p>No students found. Add a student.</p>";
    } else {
      
        const table = `
        <div>
         <canvas id="studentChart" style="width: 100%; height: 300px; margin-bottom: 20px;"></canvas>
      <table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Mark</th>
            <th>Grade</th>
              <th>Edit</th>
        </tr>
    </thead>
    <tbody>
        ${students.map((student) => `
            <tr>
                <td>
                    ${student.id}
                </td>
                <td>${student.name}</td>
                <td>${student.age}</td>
                <td>${student.mark}</td>
                <td>${student.grade}</td>
                   <td>
                  <button class="edit-btn" data-id="${student.id}">Edit</button>
                  <button class="delete-btn" data-id="${student.id}">Delete</button>
                </td>
            </tr>
        `).join('')}
    </tbody>
</table>
</div>

        `;
        if(content)
        content.innerHTML = table;
        loadEventListeners();
        getChart(students);
        
    }
    // highlightActiveLink(studentListLink);
}

async function studentForm(student:Student | null = null):Promise<void> {
  if (!content) return;
  console.log(student)
  content.innerHTML = `
    <form id="studentForm">
      <input type="text" id="studentName" placeholder="Name" value="${student?.name ?? ''}" required>
      <input type="number" id="studentAge" placeholder="Age" value="${student?.age ?? ''}" required min="1" max="150">
      <select type="text" id="studentGrade" value="${student?.grade ?? ''}" required>
        <option value="" disabled>--Please choose an option--</option> 
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
      <input type="number" id="studentMarks" placeholder="Marks" value="${student?.mark ?? ''}" required min="0" max="100">
      <button type="submit">Submit</button>
    </form>`;

  document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveStudent();
  });
    // highlightActiveLink(studentUpdateLink);
}

async function saveStudent(): Promise<void>  {
    //const studentId = parseInt((document.getElementById('studentId') as HTMLInputElement).value); 
    const studentName = (document.getElementById('studentName') as HTMLInputElement).value;
    const studentAge = parseInt((document.getElementById('studentAge') as HTMLInputElement).value);
    const studentGrade = (document.getElementById('studentGrade') as HTMLSelectElement).value;
    const studentMark = parseInt((document.getElementById('studentMarks') as HTMLInputElement).value);

    if (studentName && studentGrade) {
        const student:Student = {
          name: studentName, age: studentAge, grade: studentGrade,
          mark: studentMark
        }; 
         await saveStudentToAPI(student);
        alert('Student saved successfully!');
        listStudents();
    } else {
        alert('Please fill in all required fields.');
    }
}




studentListLink?.addEventListener('click', (e) => {
    e.preventDefault();
    listStudents();
});

studentUpdateLink?.addEventListener('click', (e) => {
    e.preventDefault();
    studentForm();
});


listStudents();



export async function getChart(students:Student[]){
  const ctx = document.getElementById('studentChart') as HTMLCanvasElement;
 

    const ages = students.map((student:Student) => {
       return student.age;
    });
   
     const names = students.map((student:Student) => {
      return student.name
     })
    
    const app: HTMLDivElement | null= document.querySelector("#app");
    app?.appendChild(ctx);
     //@ts-ignore
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: '# of Votes',
          data: ages,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
}

async function loadEventListeners() : Promise<void> {
 
  const editButtons : NodeList | undefined= document.querySelectorAll(".edit-btn");
  const deleteButtons : NodeList | undefined = document.querySelectorAll(".delete-btn");
  
  editButtons?.forEach(button => {
    button.addEventListener('click', async (event) => {
     
      const target = event.target as HTMLButtonElement;
      const studentId = target.dataset.id;
      if (studentId) {
        await updateStudent(parseInt(studentId));
     };
    });
  });
  
  
    deleteButtons?.forEach(button => {
      button.addEventListener('click', async (event) => {
        const target = event.target as HTMLButtonElement;
        const studentId = target.dataset.id;
        if (studentId && confirm('Are you sure you want to delete this student?')) {
          await deleteStudent(parseInt(studentId));
        }
      });
    });
  

}


async function deleteStudent(studentId: number): Promise<void> {
  try {
    await axios.delete(`${api_url2}/${studentId}`);
    await listStudents();
  } catch (error) {
    console.error('Error deleting student:', error);
    alert('Failed to delete student.');
  }
}

async function loadStudent(studentId: number | undefined): Promise<void> {
  try {
    const response = await axios.get<Student>(`${api_url2}/${studentId}`);
    const student = response.data;
       await studentForm(student);
  } catch (error) {
    console.error('Error loading student:', error);
    alert('Failed to load student.');
  }
}



async function updateStudent(studentId: number): Promise<void> {
  
  //const student : Student = await axios.get(`${api_url2}/${studentId}`);

  await loadStudent(studentId); 
  await axios.delete(`${api_url2}/${studentId}`);
}
