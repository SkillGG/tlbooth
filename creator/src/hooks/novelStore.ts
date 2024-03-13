import { type DBNovel } from "@/server/api/routers/db";
import { api } from "@/utils/api";
import { create } from "zustand";
import deepEquals from "fast-deep-equal";

import { trpcClient } from "@/pages/_app";

type NovelStore = {
  novels: StoreNovel[] | null;
  mutations: Mutation[];
  undoneMutations: Mutation[];
  loadData: (remote: NovelStore["novels"]) => void;
  mutate: (t: Mutation) => void;
  removeMutation: (id: string) => void;
  undo: (id: string) => void;
  redo: (id: string) => void;
  getMutated: () => StoreNovel[] | null;
  getNovel: (id: string) => StoreNovel | null;
  apply: () => Promise<(() => void)[]>;
};

export type StoreNovel = DBNovel & { local?: true; forDeletion?: true };

export enum MutationType {
  CHANGE_TITLE = "Change Title",
  ADD_NOVEL = "Add Novel",
  ADD_CHAPTER = "Add Chapter",
  DELETE_NOVEL = "Delete Novel",
}

type MutationDescription = string | ((p: StoreNovel[]) => string);

export type Dependency = {
  novelId: string;
};

export class Mutation {
  fn: (p: StoreNovel[]) => StoreNovel[];
  desc: MutationDescription;
  type: MutationType;
  id: string;
  apiFn: () => Promise<void>;
  dependencies: Dependency[];
  constructor(
    id: string,
    fn: (p: StoreNovel[]) => StoreNovel[],
    desc: MutationDescription,
    type: MutationType,
    apiFn: () => Promise<void>,
    dependencies: Dependency[],
  ) {
    this.fn = fn;
    this.id = id;
    this.desc = desc;
    this.type = type;
    this.apiFn = apiFn;
    this.dependencies = dependencies;
  }
  getDesc(n: StoreNovel[]) {
    return typeof this.desc === "function" ? this.desc(n) : this.desc;
  }
  static addNovelID = 0;
  static addNovel(url: string, name: string) {
    const novel: StoreNovel = {
      id: `localnovel_${++this.addNovelID}`,
      chapters: [],
      ogname: name,
      tlname: null,
      url,
      local: true,
      ogdesc: "",
      tldesc: "",
    };
    return new Mutation(
      `add_novel_${url}`,
      (p) => [...p, novel],
      name,
      MutationType.ADD_NOVEL,
      async () => {
        await trpcClient.db.registerNovel.mutate({ name, url });
      },
      [{ novelId: novel.id }],
    );
  }
  static removeNovel(id: string) {
    return new Mutation(
      `remove_novel_${id}`,
      (p) => p.map((n) => (n.id === id ? { ...n, forDeletion: true } : n)),
      (p) => p.find((x) => x.id === id)?.ogname ?? id,
      MutationType.DELETE_NOVEL,
      async () => {
        await trpcClient.db.removeNovel.mutate(id);
      },
      [{ novelId: id }],
    );
  }
  static changeTLName(id: string, name: string) {
    return new Mutation(
      `change_name_${id}`,
      (p) => {
        return p.map((n) => (n.id === id ? { ...n, tlname: name } : n));
      },
      name,
      MutationType.CHANGE_TITLE,
      async () => {
        // await trpcClient.db.updateNovel.mutate({ id, tlname: name });
        console.error("TODO:");
      },
      [{ novelId: id }],
    );
  }
}

export const useNovelStore = create<NovelStore>()((set, get) => ({
  novels: null,
  mutations: [],
  undoneMutations: [],
  getNovel: (id) => get().novels?.find((n) => n.id === id) ?? null,
  loadData: (remote) => set((s) => ({ ...s, novels: remote })),
  mutate: (t) =>
    set((s) => {
      console.log("adding mutation", t.id);
      const muts = [...get().mutations, ...get().undoneMutations];
      if (muts.find((m) => m.id === t.id)) return s;
      return { mutations: [...s.mutations, t] };
    }),
  removeMutation: (id) =>
    set((s) => {
      console.log("removing mutation", id);
      const linkedMutations: Mutation[] = [];
      const muts = [...get().mutations, ...get().undoneMutations];
      const thisMut = muts.find((t) => t.id === id);
      if (!thisMut) return s;
      if (thisMut.type === MutationType.ADD_NOVEL) {
        console.log("searching for linked mutations!");
        const dependants = [];
        for (const mut of muts) {
          for (const dep of mut.dependencies) {
            if (thisMut.dependencies.find((d) => deepEquals(d, dep)))
              dependants.push(mut);
          }
        }
        if (dependants) linkedMutations.push(...dependants);
      }

      console.log("linked", linkedMutations);

      const filterFn = (x: Mutation) => {
        if (x.id === id) return false;
        if (linkedMutations.find((n) => n.id === x.id)) return false;
        return true;
      };

      console.log("bef,aft", s.mutations, s.mutations.filter(filterFn));

      return {
        mutations: s.mutations.filter(filterFn),
        undoneMutations: s.undoneMutations.filter(filterFn),
      };
    }),
  undo: (id) => {
    set((s) => {
      const infT = s.mutations.find((t) => t.id === id);
      if (infT)
        return {
          mutations: s.mutations.filter((t) => t.id !== id),
          undoneMutations: [...s.undoneMutations, infT],
        };
      else return s;
    });
  },
  redo: (id) => {
    set((s) => {
      const infT = s.undoneMutations.find((t) => t.id === id);
      if (!infT) return s;
      return {
        mutations: [...s.mutations, infT],
        undoneMutations: s.undoneMutations.filter((t) => t.id !== id),
      };
    });
  },
  getMutated: () => {
    const remote = get().novels;
    if (!remote) return null;
    return get().mutations.reduce((p, n) => {
      return n.fn(p);
    }, remote);
  },
  apply: async () => {
    console.log("applying mutations");
    const sets: (() => void)[] = [];
    try {
      for (const mut of get().mutations) {
        await mut.apiFn();
        sets.push(() =>
          set((st) => ({
            mutations: st.mutations.filter((f) => f.id !== mut.id),
          })),
        );
      }
    } catch (e) {
      console.error(e);
    }
    return sets;
  },
}));
