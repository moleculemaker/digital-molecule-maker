import itertools
import os

workdir = "./src/assets/blocks/10x10x10palette"


def old_key(s_id, m_id, e_id):
    s_key = chr(ord("A") + s_id - 1)
    e_key = chr(ord("K") + e_id - 1)
    return f"{s_key}_{m_id}_{e_key}"


def new_key(s_id, m_id, e_id):
    return f"{s_id}_{m_id}_{e_id}"


def main():
    for s_id, m_id, e_id in itertools.product(range(1, 11), range(1, 11), range(1, 11)):
        k_old = old_key(s_id, m_id, e_id)
        k_new = new_key(s_id, m_id, e_id)
        os.rename(
            os.path.join(workdir, "mol2", f"{k_old}.mol2"),
            os.path.join(workdir, "mol2", f"{k_new}.mol2"),
        )
        os.rename(
            os.path.join(workdir, "smi", f"{k_old}.smi"),
            os.path.join(workdir, "smi", f"{k_new}.smi"),
        )
        os.rename(
            os.path.join(workdir, "svg", f"{k_old}.svg"),
            os.path.join(workdir, "svg", f"{k_new}.svg"),
        )


if __name__ == "__main__":
    main()
