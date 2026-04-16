import time
from pathlib import Path
from playwright.sync_api import sync_playwright

# 📂 NOVO CAMINHO
IMAGES_DIR = r"C:\Users\Gilberto\gilcorretorsp\Vivaz Connection Adolfo Pinheiro"

DADOS = {
    "titulo": "Vivaz Connection Adolfo Pinheiro – Apartamentos de 1 e 2 dormitórios em Santo Amaro",
    "slug": "vivaz-connection-adolfo-pinheiro",
    "descricao": """Apartamento em lançamento no coração de Santo Amaro, na Zona Sul de São Paulo, com excelente localização a poucos passos da estação de metrô Adolfo Pinheiro.

O empreendimento oferece unidades de 1 e 2 dormitórios com plantas inteligentes, pensadas para otimizar espaço, conforto e funcionalidade no dia a dia.

Ideal para quem busca o primeiro imóvel ou investimento, com condições facilitadas pelo programa Minha Casa Minha Vida, além de fácil acesso a comércios, serviços, transporte e lazer.

Características principais:

Próximo ao metrô, piscina, academia, salão de festas, churrasqueira, playground, pet place, bicicletário.

Condomínio:

Vivaz Connection Adolfo Pinheiro

Previsão de entrega:

Dezembro de 2028 a Fevereiro de 2029""",
    "bairro": "Santo Amaro",
    "endereco": "Rua Doutor Antônio Bento",
    "preco": "225000",
    "preco_promocional": "224999",
    "area": "24",
    "quartos": "1",
    "banheiros": "1",
    "vagas": "0",
    "lat": "-23.6470671",
    "lng": "-48.7059212",
    "seo_titulo": "Vivaz Connection Adolfo Pinheiro em Santo Amaro",
    "seo_desc": "Apartamento à venda em Santo Amaro próximo ao metrô com lazer completo."
}

def type_human(locator, text):
    locator.click()
    locator.page.keyboard.press("Control+A")
    locator.page.keyboard.press("Delete")
    locator.page.keyboard.type(str(text), delay=20)

# 🔥 separa imagens e plantas
def separar_arquivos():
    imagens = []
    plantas = []

    for f in Path(IMAGES_DIR).rglob("*.*"):
        if not f.is_file():
            continue

        caminho = str(f).lower()

        if "plantas" in caminho or "planta" in caminho:
            plantas.append(str(f))
        else:
            imagens.append(str(f))

    return imagens, plantas

def fechar_modal(page):
    try:
        page.keyboard.press("Escape")
        print("✅ Modal fechado")
    except:
        pass

# 📸 upload imagens
def upload_imagens(page, imagens):
    if not imagens:
        return

    print(f"📸 Enviando imagens ({len(imagens)})")

    page.get_by_role("button", name="Carregar Imagens").first.click()
    page.wait_for_timeout(2000)

    inputs = page.locator('input[type="file"]')

    for i in range(inputs.count()):
        try:
            inputs.nth(i).set_input_files(imagens)
            time.sleep(3)
            print("✅ Imagens enviadas")
            break
        except:
            pass

    fechar_modal(page)

# 📐 upload plantas (ROBUSTO)
def upload_plantas(page, plantas):
    if not plantas:
        return

    print(f"📐 Enviando plantas ({len(plantas)})")

    try:
        titulo = page.locator("text=Plantas Humanizadas").first
        titulo.scroll_into_view_if_needed()

        container = titulo.locator("xpath=ancestor::div[3]")
        botao = container.locator('button:has-text("Carregar Imagens")')

        if botao.count() == 0:
            raise Exception("Botão não encontrado")

        botao.first.click()

        page.wait_for_timeout(2000)

        inputs = page.locator('input[type="file"]')

        for i in range(inputs.count()):
            try:
                inputs.nth(i).set_input_files(plantas)
                print("✅ Plantas enviadas")
                time.sleep(3)
                break
            except:
                pass

        fechar_modal(page)

    except Exception as e:
        print("⚠️ Erro no método principal:", e)
        print("👉 Tentando fallback...")

        try:
            page.get_by_role("button", name="Carregar Imagens").last.click()
            page.wait_for_timeout(2000)

            page.locator('input[type="file"]').last.set_input_files(plantas)

            print("✅ Plantas enviadas via fallback")

            fechar_modal(page)

        except Exception as e2:
            print("❌ Falha total no upload de plantas:", e2)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=200)
        page = browser.new_page()

        page.goto("https://www.gilcorretorsp.com.br/")

        input("👉 Faça login e ENTER...")
        input("👉 Abra 'Adicionar Imóvel' e ENTER...")

        # básico
        type_human(page.get_by_placeholder("Ex: Apartamento de Luxo na"), DADOS["titulo"])
        type_human(page.locator('input[name="slug"]'), DADOS["slug"])

        editor = page.locator(".ql-editor")
        editor.click()
        page.keyboard.press("Control+A")
        page.keyboard.press("Delete")
        page.keyboard.type(DADOS["descricao"], delay=5)

        type_human(page.locator('input[name="neighborhood"]'), DADOS["bairro"])
        type_human(page.locator('input[name="address"]'), DADOS["endereco"])
        type_human(page.locator('input[name="lat"]'), DADOS["lat"])
        type_human(page.locator('input[name="lng"]'), DADOS["lng"])

        # detalhes
        page.get_by_role("tab", name="Detalhes").click()
        page.get_by_role("radio", name="Venda").click()

        type_human(page.locator('input[name="price"]'), DADOS["preco"])
        type_human(page.get_by_placeholder("Ex:"), DADOS["preco_promocional"])
        type_human(page.locator('input[name="area"]'), DADOS["area"])
        type_human(page.locator('input[name="bedrooms"]'), DADOS["quartos"])
        type_human(page.locator('input[name="bathrooms"]'), DADOS["banheiros"])
        type_human(page.locator('input[name="parking_spaces"]'), DADOS["vagas"])

        # mídia
        page.get_by_role("tab", name="Mídia").click()

        imagens, plantas = separar_arquivos()

        upload_imagens(page, imagens)
        upload_plantas(page, plantas)

        # infra
        page.get_by_role("tab", name="Infra").click()

        for item in ["Piscina adulto", "Academia", "Churrasqueira"]:
            try:
                page.get_by_role("checkbox", name=item).click()
            except:
                pass

        # SEO
        page.get_by_role("tab", name="SEO", exact=True).click()

        type_human(page.get_by_placeholder("Ex: Apartamento 3 quartos em"), DADOS["seo_titulo"])
        type_human(page.get_by_placeholder("Ex: Apartamento moderno com 3"), DADOS["seo_desc"])

        # final
        page.get_by_role("tab", name="Contato").click()

        input("👉 Revise e ENTER para salvar...")

        page.get_by_role("button", name="Salvar Imóvel").click()

        time.sleep(5)
        print("\n🎉 IMÓVEL CADASTRADO COM SUCESSO")
        print("🔗 URL:", page.url)

        input("ENTER para fechar...")
        browser.close()

if __name__ == "__main__":
    run()