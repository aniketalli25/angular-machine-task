import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isTransparent = true;
  isScrolled = false;
  isPopupVisible: boolean = false;
  profileForm!: FormGroup;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('interestInput') interestInput: any;
  interests: string[] = [];


  constructor(
    private formBuilder: FormBuilder,
    public http: HttpClient,
    private router: Router,
    private elRef: ElementRef  // Inject ElementRef here
  ) {}

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      addressType: ['home'],
      interest: ['', Validators.required],
      interests: [''],
      mobileNumber:['',Validators.required],
      emailId:['',Validators.required],
      address1: ['', Validators.required],
      address2: ['', Validators.required],
      companyAddress1: [''],
      companyAddress2: [''],
      age: [0, Validators.required],
      about: ['', Validators.required],
      profileImage: [null, Validators.required]
    });



    // Subscribe to changes in the addressType control
    this.profileForm.get('addressType')?.valueChanges.subscribe((value) => {
      const address1Control = this.profileForm.get('address1');
      const address2Control = this.profileForm.get('address2');
      const companyAddress1Control = this.profileForm.get('companyAddress1');
      const companyAddress2Control = this.profileForm.get('companyAddress2');

      // Clear validators for all address fields
      address1Control?.clearValidators();
      address2Control?.clearValidators();
      companyAddress1Control?.clearValidators();
      companyAddress2Control?.clearValidators();

      // Set validators based on selected address type
      if (value === 'home') {
        address1Control?.setValidators(Validators.required);
        address2Control?.setValidators(Validators.required);
      } else if (value === 'company') {
        companyAddress1Control?.setValidators(Validators.required);
        companyAddress2Control?.setValidators(Validators.required);
      }

      // Update validation status
      address1Control?.updateValueAndValidity();
      address2Control?.updateValueAndValidity();
      companyAddress1Control?.updateValueAndValidity();
      companyAddress2Control?.updateValueAndValidity();
    });
  }

  togglePopup() {
    this.isPopupVisible = !this.isPopupVisible;
  }


  addInterest() {
    const value = this.interestInput.nativeElement.value.trim();
    const regex = /^[a-zA-Z\s,]+$/;

    if (regex.test(value)) {
        this.interests.push(value);
        this.interestInput.nativeElement.value = ''; // Clear the input field after adding interest
    }
}



submitForm() {
  if (this.profileForm.valid) {
    this.profileForm.patchValue({
      interests: this.interests
    });

    this.http.post('http://localhost:3000/profiles', this.profileForm.value).subscribe((res: any) => {
      // Extract ID from the response
      const id = res.id; // Assuming the response contains an 'id' field

      alert('Data posted successfully');

      // Navigate to a specific route with the ID
      this.router.navigate(['./profile'] ,{
        state: {
          formData: this.profileForm.value,
          interests: this.interests,
          id
           // Pass the ID to the next route
        }
      });
    });
  } else {
    alert('Please fill in all required fields.');
  }
}
// submitForm() {
//   if (this.profileForm.valid) {
//     this.profileForm.patchValue({
//       interests: this.interests
//     });

//     this.http.post('http://localhost:3000/profiles', this.profileForm.value).subscribe((res: any) => {
//       const id = res.id;
//       alert('Data posted successfully');

//       // Navigate to profile page with the extracted ID
//       this.router.navigate(['./profile', id]); // Make sure 'id' is passed here
//     });
//   } else {
//     alert('Please fill in all required fields.');
//   }
// }


  handleFileInput(event: any) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.profileForm.patchValue({
            profileImage: reader.result
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  preventClosing(event: Event) {
    event.stopPropagation();
  }
   removeInterest(index: number) {
    this.interests.splice(index, 1);
  }

//   addInterest(event: KeyboardEvent): void {
//     const keyboardEvent = event as KeyboardEvent;
//     if (keyboardEvent.key === 'Enter') {
//         event.preventDefault();

//         const input = this.elementRef.nativeElement.querySelector('.interest-input') as HTMLInputElement;
//         const value = input.value.trim();
//         if (value) {
//             const newInterest = {
//                 "interestName": value,
//             };
//             if (!this.profileForm.get('interests')) {
//                 this.profileForm.addControl('interests', this.formBuilder.array([]));
//             }
//             const interests = this.profileForm.get('interests') as FormArray;
//             interests.push(this.formBuilder.control(newInterest));
//             input.value = '';
//         }
//     }
// }

}
