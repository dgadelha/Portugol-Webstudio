import { LiveAnnouncer } from "@angular/cdk/a11y";
import { DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, resource, signal } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

import { ExerciseMarkdownService } from "../exercise-markdown.service";
import {
  attributionText,
  DIFFICULTY_ICONS,
  DIFFICULTY_LABELS,
  ExercisesService,
  Exercício,
  TOPIC_ICONS,
} from "../exercises.service";
import { ResponsiveService } from "../responsive.service";
import { TooltipDirective } from "../shared/tooltip.directive";

interface ExerciseEntry {
  id: string;
  title: string;
  difficulty: Exercício["dificuldade"];
  difficultyIcon: string;
  topic: string;
  topicIcon: string;
  searchText: string;
}

interface ExerciseGroup {
  topic: string;
  icon: string;
  entries: ExerciseEntry[];
}

/**
 * A lista dos exercícios, por tópico, com o enunciado do escolhido ao lado.
 */
@Component({
  selector: "app-dialog-open-exercise",
  imports: [AngularSvgIconModule, TooltipDirective],
  templateUrl: "./dialog-open-exercise.component.html",
  styleUrls: ["../dialog-open-example/dialog-open-example.component.scss", "./dialog-open-exercise.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogOpenExerciseComponent implements OnInit {
  private exercises = inject(ExercisesService);
  private markdown = inject(ExerciseMarkdownService);
  private responsive = inject(ResponsiveService);
  private announcer = inject(LiveAnnouncer);

  /**
   * O diálogo fecha com o exercício escolhido, e a janela o abre numa aba.
   */
  readonly dialogRef = inject<DialogRef<{ id: string }>>(DialogRef);

  readonly difficultyLabels = DIFFICULTY_LABELS;

  readonly isBelowMd = this.responsive.isBelowMd;
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly query = signal("");
  readonly entries = signal<ExerciseEntry[]>([]);
  readonly current = signal<ExerciseEntry | null>(null);

  /**
   * O enunciado do exercício escolhido, para a prévia, e de onde ele foi adaptado, se foi.
   */
  readonly statement = resource({
    params: () => this.current()?.id,
    loader: async ({ params }) => {
      const exercise = await this.exercises.load(params);

      return {
        html: await this.markdown.render(exercise.enunciado),
        attribution: attributionText(exercise),
      };
    },
  });

  readonly filtered = computed(() => {
    const terms = this.normalize(this.query()).split(/\s+/).filter(Boolean);

    return this.entries().filter(entry => terms.every(term => entry.searchText.includes(term)));
  });

  readonly groups = computed(() => {
    const groups: ExerciseGroup[] = [];

    for (const entry of this.filtered()) {
      const group = groups.find(g => g.topic === entry.topic);

      if (group) {
        group.entries.push(entry);
      } else {
        groups.push({ topic: entry.topic, icon: entry.topicIcon, entries: [entry] });
      }
    }

    return groups;
  });

  readonly activeDescendant = computed(() => {
    const current = this.current();

    return current ? this.optionId(current) : null;
  });

  readonly doneCount = computed(() => this.entries().filter(entry => this.isDone(entry)).length);

  ngOnInit() {
    void this.loadEntries();
  }

  private async loadEntries() {
    try {
      const index = await this.exercises.loadIndex();

      this.entries.set(
        index.flatMap(topic => {
          return topic.itens.map(item => {
            return {
              id: item.id,
              title: item.título,
              difficulty: item.dificuldade,
              difficultyIcon: DIFFICULTY_ICONS[item.dificuldade],
              topic: topic.nome,
              topicIcon: TOPIC_ICONS[topic.tópico],
              searchText: this.normalize(`${item.título} ${topic.nome} ${this.difficultyLabels[item.dificuldade]}`),
            };
          });
        }),
      );

      this.selectFirst();
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchInput(event: Event) {
    this.search((event.target as HTMLInputElement).value);
  }

  search(query: string) {
    this.query.set(query);

    if (this.filtered().length === 0) {
      if (this.current()) {
        void this.announcer.announce("Nenhum exercício encontrado.", "polite");
      }

      this.current.set(null);
      return;
    }

    if (this.filtered().every(entry => entry.id !== this.current()?.id)) {
      this.selectFirst();
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    const list = this.filtered();
    const index = list.findIndex(entry => entry.id === this.current()?.id);

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();

        const next = list.at(event.key === "ArrowDown" ? Math.min(index + 1, list.length - 1) : Math.max(index - 1, 0));

        if (next && next.id !== this.current()?.id) {
          this.current.set(next);
          document.querySelector(`#${CSS.escape(this.optionId(next))}`)?.scrollIntoView({ block: "nearest" });
        }

        break;
      }

      case "Enter": {
        const current = this.current();

        if (current) {
          event.preventDefault();
          this.open(current);
        }

        break;
      }
    }
  }

  onItemClick(entry: ExerciseEntry) {
    // Em telas pequenas não há prévia: o clique já abre o exercício
    if (this.isBelowMd()) {
      this.open(entry);
    } else {
      this.current.set(entry);
    }
  }

  openCurrent() {
    const current = this.current();

    if (current) {
      this.open(current);
    }
  }

  open(entry: ExerciseEntry) {
    this.dialogRef.close({ id: entry.id });
  }

  optionId(entry: ExerciseEntry) {
    return `exercicio-${entry.id.replace(":", "-")}`;
  }

  isDone(entry: ExerciseEntry) {
    return this.exercises.isDone(entry.id);
  }

  private selectFirst() {
    const first = this.filtered()[0];

    if (first && !this.isBelowMd()) {
      this.current.set(first);
    }
  }

  private normalize(text: string) {
    return text
      .normalize("NFD")
      .replaceAll(/\p{Diacritic}/gu, "")
      .toLowerCase();
  }
}
