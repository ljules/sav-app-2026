import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive], // AJOUTER ICI LE ROUTAGE
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

}
