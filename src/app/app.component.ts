import { Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs';
import { select } from 'ng2-redux';
import { MyActions } from './store/actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isSignedOut: boolean;

  @select(['UserReducer', 'type'])
  user$: Observable<any>; // gets User State of the app

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private angularFire: AngularFire,
    private actions: MyActions
  ){
    this.user$.subscribe(x => {
        // console.log('app state: ', x);
        this.isSignedOut = (x === 'signedout' || x === undefined) ? true : false;
        // console.log('isSignedOut: ', this.isSignedOut)
    });
  }

  signOut() {
    // 'signout' action dispatched from redux
    this.actions.signOut();
    this.angularFire.auth.logout();
    this.router.navigate(['home']); // navigate back to home page
    alert('Please Sign In to continue...');
  }

}
