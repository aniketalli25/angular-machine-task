import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('exampleModal') modal!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('interestInput') interestInput: any;

  interests: string[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public router: Router
  ) {}

  formData: any = {id:''};
  profileForm!: FormGroup;

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      emailId: ['', Validators.required],
      addressType: ['', Validators.required],
      interests: [''],
      interest: [''],

      address1: ['', Validators.required],
      address2: ['', Validators.required],
      companyAddress1: ['', Validators.required],
      companyAddress2: ['', Validators.required],
      age: ['', Validators.required],
      profileImage: [''],
      about: ['', Validators.required]
    });
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
    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); // Assuming you're passing the profile ID in the route
      if (id) {
        this.fetchDataFromServer(id);
      } else if (window.history.state.formData) {
        this.formData = { ...window.history.state.formData };
        this.populateForm(this.formData);
      }
    });
  }

  populateForm(data: any) {
    this.interests = data.interests;
    this.profileForm.patchValue(data);

  }

  // saveDataToServer() {
  //   if (this.profileForm.valid) {
  //     const id = this.profileForm.value.id; // Extracting id from form
  //     const profileData = this.profileForm.value;

  //     // Perform the PUT request to update the profile
  //     this.http.post(`http://localhost:3000/profiles/${id}`, profileData)
  //       .subscribe(
  //         (res: any) => {
  //           console.log('Profile updated successfully:', res);
  //           alert('Profile updated successfully!');
  //           this.populateForm(res); // Update the form with updated data
  //         },
  //         (error: any) => {
  //           console.error('Error updating profile:', error);
  //           alert('Failed to update profile. Please try again later.');
  //         }
  //       );
  //   } else {
  //     alert('Please fill in all required fields.');
  //   }
  // }
  saveDataToServer() {
    if (this.profileForm.valid) {
      const id = this.profileForm.value.id; // Extracting id from form
      const profileData = this.profileForm.value;

      // Perform the PUT request to update the profile
      this.http.post(`http://localhost:3000/profiles/${id}`, profileData)
        .subscribe(
          (res: any) => {
            console.log('Profile updated successfully:', res);
            alert('Profile updated successfully!');
            this.populateForm(res); // Update the form with updated data
             // Close modal after successful update
          },
          (error: any) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again later.');
          }
        );
    } else {
      alert('Please fill in all required fields.');
    }
  }

  fetchDataFromServer(id: string) {
    this.http.get(`http://localhost:3000/profiles/${id}`)
      .subscribe(
        (res: any) => {
          this.populateForm(res); // Update the form with fetched data
        },
        (error: any) => {
          console.error('Error fetching profile data:', error);
        }
      );
  }

  editPhoto() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('File input element not found.');
    }
  }

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

  removeInterest(index: number) {
    this.interests.splice(index, 1);
  }

  addInterest() {
    const value = this.interestInput.nativeElement.value.trim();
    const regex = /^[a-zA-Z\s,]+$/;

    if (regex.test(value)) {
      this.interests.push(value);
      this.interestInput.nativeElement.value = ''; // Clear the input field after adding interest
    }
  }
}
