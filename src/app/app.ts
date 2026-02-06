import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

type SkillFilter = 'all' | 'backend' | 'web' | 'db' | 'tools' | 'soft';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatChipsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  // --- Skills filter ---
  skillFilter: SkillFilter = 'all';

  skills = {
    backend: ['Java', 'OOP (Java)', 'Spring Framework'],
    web: ['HTML', 'CSS', 'JavaScript'],
    db: ['SQL', 'MySQL', 'Gestione e interrogazione dati'],
    tools: ['Eclipse', 'Visual Studio', 'Ticketing'],
    soft: ['Team work', 'Problem solving', 'Gestione priorità', 'Affidabilità', 'Calma sotto pressione'],
  } as const;

  setSkillFilter(v: SkillFilter) {
    this.skillFilter = v;
  }

  filteredSkills(): string[] {
    if (this.skillFilter === 'all') {
      return [
        ...this.skills.backend,
        ...this.skills.web,
        ...this.skills.db,
        ...this.skills.tools,
        ...this.skills.soft,
      ];
    }
    return [...this.skills[this.skillFilter]];
  }

  // --- Scroll handlers cleanup ---
  private onScrollUpdateLine?: () => void;
  private onResizeUpdateLine?: () => void;

  ngAfterViewInit(): void {
    // Glow on scroll for cards
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.t-card, .subcard'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-inview');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );
    cards.forEach((el) => io.observe(el));

    // Timeline fill on scroll
    const timeline = document.querySelector<HTMLElement>('.timeline');
    const fill = document.getElementById('timelineFill') as HTMLElement | null;

    const updateLine = () => {
      if (!timeline || !fill) return;

      const rect = timeline.getBoundingClientRect();
      const viewH = window.innerHeight || document.documentElement.clientHeight;

      const start = viewH * 0.2;
      const end = viewH * 0.8;

      const denom = rect.height - (end - start);
      const raw = denom > 0 ? (start - rect.top) / denom : 0;
      const p = Math.max(0, Math.min(1, raw));

      fill.style.height = `${p * 100}%`;
    };

    this.onScrollUpdateLine = updateLine;
    this.onResizeUpdateLine = updateLine;

    window.addEventListener('scroll', this.onScrollUpdateLine, { passive: true });
    window.addEventListener('resize', this.onResizeUpdateLine);
    updateLine();
  }

  ngOnDestroy(): void {
    if (this.onScrollUpdateLine) window.removeEventListener('scroll', this.onScrollUpdateLine);
    if (this.onResizeUpdateLine) window.removeEventListener('resize', this.onResizeUpdateLine);
  }

  /**
   * Smooth scroll (no teleport) with navbar offset.
   * Used by app.html via (click)="smoothScroll('id')"
   */
  smoothScroll(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 84;
    const target = el.getBoundingClientRect().top + window.scrollY - headerOffset;

    const start = window.scrollY;
    const distance = target - start;
    const duration = 650; // ms

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  /**
   * Alias kept for compatibility (if any old template still calls scrollTo).
   */
  scrollTo(id: string) {
    this.smoothScroll(id);
  }
}